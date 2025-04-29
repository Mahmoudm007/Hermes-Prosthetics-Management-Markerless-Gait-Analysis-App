import json
import os
import uuid
import math
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
import pandas as pd
import aiohttp
import aiofiles
from fastapi import HTTPException, status
from scipy.signal import find_peaks, butter, filtfilt
from scipy.interpolate import interp1d
import mediapipe as mp
from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2

from pydantic import BaseModel
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from src.db.model.gait_session import GaitSession
from src.config import Config

GAIT_SESSIONS_RUNTIME_DIR = os.path.join("src", "gait_sessions", "runtime")
GAIT_SESSIONS_ASSETS_DIR = os.path.join("src", "gait_sessions", "assets")
GAIT_SESSIONS_MODEL_PATH = os.path.join(
    GAIT_SESSIONS_ASSETS_DIR, "model", "pose_landmarker_heavy.task"
)


class GaitAnalysisOutput(BaseModel):
    detailed_analysis: str  # Markdown, comprehensive answers to all questions
    summary: str  # Concise summary
    recommendations: List[str]  # Actionable recommendations
    recommended_exercises: List[str]  # Specific exercises to improve gait
    possible_abnormalities: List[str]  # Specific abnormalities or issues
    long_term_risks: List[str]  # Potential long-term risks or complications


GOOGLE_API_KEY = Config.GOOGLE_API_KEY


class GaitAnalysisPipeline:
    """Pipeline for processing gait analysis videos."""

    def __init__(self, model_path: str = GAIT_SESSIONS_MODEL_PATH):
        self.model_path = model_path
        # selfandmarker = self._initialize_landmarker()
        self.llm = self.initialize_llm()

    def _initialize_landmarker(self):
        """Initialize MediaPipe Pose Landmarker with thread-safe configuration."""
        try:
            options = mp.tasks.vision.PoseLandmarkerOptions(
                base_options=mp.tasks.BaseOptions(model_asset_path=self.model_path),
                running_mode=mp.tasks.vision.RunningMode.VIDEO,
                min_pose_detection_confidence=0.5,
                # TODO: Remove this
                # num_poses=1,
            )
            landmarker = mp.tasks.vision.PoseLandmarker.create_from_options(options)
            return landmarker
        except Exception as e:
            print(f"Failed to initialize Pose Landmarker: {str(e)}")
            raise RuntimeError(f"Pose Landmarker initialization failed: {str(e)}")

    def initialize_llm(self) -> ChatGoogleGenerativeAI:
        """Initialize and return the Google Gemini LLM."""
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY, temperature=0.7
        )

    def draw_landmarks_on_image(self, rgb_image, detection_result):
        """Draw pose landmarks on the image."""
        pose_landmarks_list = detection_result.pose_landmarks
        annotated_image = np.copy(rgb_image)
        for idx in range(len(pose_landmarks_list)):
            pose_landmarks = pose_landmarks_list[idx]
            pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
            pose_landmarks_proto.landmark.extend(
                [
                    landmark_pb2.NormalizedLandmark(
                        x=landmark.x, y=landmark.y, z=landmark.z
                    )
                    for landmark in pose_landmarks
                ]
            )
            solutions.drawing_utils.draw_landmarks(
                annotated_image,
                pose_landmarks_proto,
                solutions.pose.POSE_CONNECTIONS,
                solutions.drawing_styles.get_default_pose_landmarks_style(),
            )
        return annotated_image

    async def save_annotated_video(
        self, frames: List[np.ndarray], frame_rate: float
    ) -> str:
        """Save annotated video to a temporary file with optimized H.264 encoding."""
        output_dir = os.path.join(GAIT_SESSIONS_RUNTIME_DIR, "output_videos")
        os.makedirs(output_dir, exist_ok=True)

        output_video_filename = uuid.uuid4().hex
        output_video_path = os.path.join(output_dir, output_video_filename + ".mp4")

        if len(frames[0].shape) == 2:
            height, width = frames[0].shape
            frames = [cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR) for frame in frames]
        else:
            height, width, _ = frames[0].shape

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(
            output_video_path, fourcc, frame_rate, (width, height), isColor=True
        )

        for frame in frames:
            out.write(frame)
        out.release()

        return output_video_path

    async def process_video(
        self, video_path: str
    ) -> Tuple[List[np.ndarray], List[float], List[float], float]:
        """Process video to extract landmarks and distances with robust resource management."""
        landmarker = self._initialize_landmarker()

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            landmarker.close()
            raise RuntimeError(f"Failed to open video: {video_path}")

        frame_rate = cap.get(cv2.CAP_PROP_FPS)
        if frame_rate <= 0:
            cap.release()
            landmarker.close()
            raise ValueError("Invalid frame rate detected")

        frame_number = 0
        annotated_frames = []
        dist_left, dist_right = [], []

        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                numpy_frame_from_opencv = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(
                    image_format=mp.ImageFormat.SRGB, data=numpy_frame_from_opencv
                )
                frame_timestamp_ms = int(frame_number * (1000 / frame_rate))
                pose_landmarker_result = landmarker.detect_for_video(
                    mp_image, frame_timestamp_ms
                )
                annotated_image = self.draw_landmarks_on_image(
                    frame, pose_landmarker_result
                )
                annotated_frames.append(annotated_image)

                if pose_landmarker_result.pose_landmarks:
                    landmarks = pose_landmarker_result.pose_landmarks[0]
                    keypoint_data = [
                        (landmark.x, landmark.y, landmark.z) for landmark in landmarks
                    ]
                    left_hip = np.array(keypoint_data[23])
                    right_hip = np.array(keypoint_data[24])
                    left_foot_index = np.array(keypoint_data[31])
                    right_foot_index = np.array(keypoint_data[32])
                    dist_left.append(
                        np.linalg.norm(np.subtract(left_hip, left_foot_index))
                    )
                    dist_right.append(
                        np.linalg.norm(np.subtract(right_hip, right_foot_index))
                    )

                frame_number += 1
        except Exception as e:
            print(f"Error processing video frame {frame_number}: {str(e)}")
            raise RuntimeError(f"Video processing failed: {str(e)}")
        finally:
            cap.release()
            landmarker.close()
            cv2.destroyAllWindows()

        if frame_number == 0:
            raise ValueError("No frames processed from video")

        return annotated_frames, dist_left, dist_right, math.floor(frame_rate)

    def gap_fill(
        self, dist_left: List[float], dist_right: List[float]
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Fill gaps in distance data using cubic interpolation."""
        x = np.arange(len(dist_left))
        interp_func_left = interp1d(
            x, dist_left, kind="cubic", fill_value="extrapolate"
        )
        interp_func_right = interp1d(
            x, dist_right, kind="cubic", fill_value="extrapolate"
        )
        dist_left_filled = interp_func_left(x)
        dist_right_filled = interp_func_right(x)
        return dist_left_filled, dist_right_filled

    def butterworth_low_pass_filter(
        self,
        dist_left_filled: np.ndarray,
        dist_right_filled: np.ndarray,
        frame_rate: float,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Apply Butterworth low-pass filter to distance data."""
        fs = len(dist_left_filled) / frame_rate
        nyq = 0.5 * fs
        cutoff = 0.1752
        order = 10
        normal_cutoff = cutoff / nyq
        b, a = butter(order, normal_cutoff, btype="low", analog=False)
        dist_left_filtered = filtfilt(b, a, dist_left_filled)
        dist_right_filtered = filtfilt(b, a, dist_right_filled)
        return dist_left_filtered, dist_right_filtered

    def detect_gait_events(
        self,
        dist_left_filtered: np.ndarray,
        dist_right_filtered: np.ndarray,
        frame_rate: float,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Detect gait events (peaks and minima)."""
        peaks_left, _ = find_peaks(dist_left_filtered, distance=0.8 * frame_rate)
        peaks_right, _ = find_peaks(dist_right_filtered, distance=0.8 * frame_rate)
        minima_left, _ = find_peaks(-dist_left_filtered, distance=0.8 * frame_rate)
        minima_right, _ = find_peaks(-dist_right_filtered, distance=0.8 * frame_rate)
        return peaks_left, peaks_right, minima_left, minima_right

    def calculate_gait_parameters(
        self,
        peaks_left: np.ndarray,
        peaks_right: np.ndarray,
        minima_left: np.ndarray,
        minima_right: np.ndarray,
        frame_rate: float,
    ) -> Tuple[List[float], ...]:
        """Calculate gait parameters."""
        stance_times_left = []
        for i in range(len(peaks_left)):
            subsequent_minima = [
                minima for minima in minima_left if minima > peaks_left[i]
            ]
            if subsequent_minima:
                stance_time = (subsequent_minima[0] - peaks_left[i]) / frame_rate
                stance_times_left.append(stance_time)

        stance_times_right = []
        for i in range(len(peaks_right)):
            subsequent_minima = [
                minima for minima in minima_right if minima > peaks_right[i]
            ]
            if subsequent_minima:
                stance_time = (subsequent_minima[0] - peaks_right[i]) / frame_rate
                stance_times_right.append(stance_time)

        try:
            swing_time_left = [
                (peaks_left[i + 1] - minima_left[i]) / frame_rate
                for i in range(len(minima_left) - 1)
            ]
        except IndexError:
            swing_time_left = [
                (peaks_left[i + 1] - minima_left[i]) / frame_rate
                for i in range(min(len(peaks_left) - 1, len(minima_left)))
            ]

        try:
            swing_time_right = [
                (peaks_right[i + 1] - minima_right[i]) / frame_rate
                for i in range(len(minima_right) - 1)
            ]
        except IndexError:
            swing_time_right = [
                (peaks_right[i + 1] - minima_right[i]) / frame_rate
                for i in range(min(len(peaks_right) - 1, len(minima_right)))
            ]

        try:
            step_time_left = [
                (peaks_left[i + 1] - peaks_left[i]) / frame_rate
                for i in range(len(peaks_left) - 1)
            ]
        except IndexError:
            step_time_left = [
                (peaks_left[i + 1] - peaks_left[i]) / frame_rate
                for i in range(len(peaks_left) - 2)
            ]

        try:
            step_time_right = [
                (peaks_right[i + 1] - peaks_right[i]) / frame_rate
                for i in range(len(peaks_right) - 1)
            ]
        except IndexError:
            step_time_right = [
                (peaks_right[i + 1] - peaks_right[i]) / frame_rate
                for i in range(len(peaks_right) - 2)
            ]

        double_support_times_left = []
        for i in range(len(peaks_left) - 1):
            subsequent_right_toe_off = [m for m in minima_right if m > peaks_left[i]]
            if subsequent_right_toe_off:
                double_support_duration_left = (
                    subsequent_right_toe_off[0] - peaks_left[i]
                ) / frame_rate
                double_support_times_left.append(double_support_duration_left)

        double_support_times_right = []
        for i in range(len(peaks_right) - 1):
            subsequent_left_toe_off = [m for m in minima_left if m > peaks_right[i]]
            if subsequent_left_toe_off:
                double_support_duration_right = (
                    subsequent_left_toe_off[0] - peaks_right[i]
                ) / frame_rate
                double_support_times_right.append(double_support_duration_right)

        return (
            stance_times_left,
            stance_times_right,
            swing_time_left,
            swing_time_right,
            step_time_left,
            step_time_right,
            double_support_times_left,
            double_support_times_right,
        )

    def create_results_dataframe(
        self,
        stance_times_left: List[float],
        stance_times_right: List[float],
        swing_time_left: List[float],
        swing_time_right: List[float],
        step_time_left: List[float],
        step_time_right: List[float],
        double_support_times_left: List[float],
        double_support_times_right: List[float],
    ) -> pd.DataFrame:
        """Create DataFrame of gait metrics."""
        max_len = max(
            len(stance_times_left),
            len(stance_times_right),
            len(swing_time_left),
            len(swing_time_right),
            len(step_time_left),
            len(step_time_right),
            len(double_support_times_left),
            len(double_support_times_right),
        )

        def pad_list(lst, max_len, pad_value=np.nan):
            return lst + [pad_value] * (max_len - len(lst))

        df = pd.DataFrame(
            {
                "Stance Time Left": pad_list(stance_times_left, max_len),
                "Stance Time Right": pad_list(stance_times_right, max_len),
                "Swing Time Left": pad_list(swing_time_left, max_len),
                "Swing Time Right": pad_list(swing_time_right, max_len),
                "Step Time Left": pad_list(step_time_left, max_len),
                "Step Time Right": pad_list(step_time_right, max_len),
                "Double Support Times Left": pad_list(
                    double_support_times_left, max_len
                ),
                "Double Support Times Right": pad_list(
                    double_support_times_right, max_len
                ),
            }
        )
        return df

    def generate_result_string(
        self,
        stance_times_left: List[float],
        stance_times_right: List[float],
        swing_time_left: List[float],
        swing_time_right: List[float],
        step_time_left: List[float],
        step_time_right: List[float],
        double_support_times_left: List[float],
        double_support_times_right: List[float],
    ) -> str:
        """Generate summary string of gait metrics."""
        result = (
            f"Stance Time Left: {stance_times_left}, "
            f"Stance Time Right: {stance_times_right}, "
            f"Swing Time Left: {swing_time_left}, "
            f"Swing Time Right: {swing_time_right}, "
            f"Step Time Left: {step_time_left}, "
            f"Step Time Right: {step_time_right}, "
            f"Double Support Times Left: {double_support_times_left}, "
            f"Double Support Times Right: {double_support_times_right}"
        )
        return result

    async def run_analysis(self, gait_session: GaitSession, video_url: str) -> Tuple[
        str,
        pd.DataFrame,
        float,
        np.ndarray,
        np.ndarray,
        np.ndarray,
        np.ndarray,
        np.ndarray,
        np.ndarray,
        GaitAnalysisOutput,
    ]:
        """Run the full gait analysis pipeline."""

        # Download video from Cloudinary
        local_video_path = await self.download_video(video_url)

        try:
            # Process video
            annotated_frames, dist_left, dist_right, frame_rate = (
                await self.process_video(local_video_path)
            )

            # Signal processing
            dist_left_filled, dist_right_filled = self.gap_fill(dist_left, dist_right)
            dist_left_filtered, dist_right_filtered = self.butterworth_low_pass_filter(
                dist_left_filled, dist_right_filled, frame_rate
            )

            # Detect gait events
            peaks_left, peaks_right, minima_left, minima_right = (
                self.detect_gait_events(
                    dist_left_filtered, dist_right_filtered, frame_rate
                )
            )

            # Calculate gait parameters
            (
                stance_times_left,
                stance_times_right,
                swing_time_left,
                swing_time_right,
                step_time_left,
                step_time_right,
                double_support_times_left,
                double_support_times_right,
            ) = self.calculate_gait_parameters(
                peaks_left, peaks_right, minima_left, minima_right, frame_rate
            )

            # Create DataFrame
            df = self.create_results_dataframe(
                stance_times_left,
                stance_times_right,
                swing_time_left,
                swing_time_right,
                step_time_left,
                step_time_right,
                double_support_times_left,
                double_support_times_right,
            )

            # Generate result string
            result = self.generate_result_string(
                stance_times_left,
                stance_times_right,
                swing_time_left,
                swing_time_right,
                step_time_left,
                step_time_right,
                double_support_times_left,
                double_support_times_right,
            )

            # Save and upload annotated video
            output_video_path = await self.save_annotated_video(
                annotated_frames, frame_rate
            )

            annotated_video_url = await self.upload_to_cloudinary(output_video_path)
            # annotated_video_url = "https://res.cloudinary.com/deuvh8isd/video/upload/v1745790144/patients/qtkqbqefqhnwxarmm6aw.mp4"

            patient_info = {
                "age": gait_session.patient.age or "N/A",
                "weight": gait_session.patient.weight or "N/A",
                "prosthetics": gait_session.patient.prosthetics or [],
                "medical_conditions": gait_session.patient.medical_conditions or [],
                "injuries": gait_session.patient.injuries or [],
                "gait_data": result,
            }
            ai_analysis = self.ask_gait_analysis(patient_info=patient_info)

            return (
                annotated_video_url,
                df,
                frame_rate,
                dist_left_filtered,
                dist_right_filtered,
                peaks_left,
                peaks_right,
                minima_left,
                minima_right,
                ai_analysis,
            )
        finally:
            # Clean up local files
            if os.path.exists(local_video_path):
                os.remove(local_video_path)
            if "output_video_path" in locals() and os.path.exists(output_video_path):
                os.remove(output_video_path)

    async def download_video(self, video_url: str) -> str:
        """Download video from Cloudinary URL to a temporary file."""
        temp_dir = os.path.join(GAIT_SESSIONS_RUNTIME_DIR, "temp_videos")
        os.makedirs(temp_dir, exist_ok=True)

        temp_file = os.path.join(temp_dir, f"{uuid.uuid4().hex}.mp4")

        async with aiohttp.ClientSession() as session:
            async with session.get(video_url) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Failed to download video: {response.status}",
                    )
                async with aiofiles.open(temp_file, mode="wb") as f:
                    await f.write(await response.read())

        return temp_file

    async def upload_to_cloudinary(self, video_path: str) -> str:
        """Upload annotated video to Cloudinary."""
        CLOUD_NAME = Config.CLOUD_NAME
        UPLOAD_PRESET = Config.UPLOAD_PRESET
        CLOUDINARY_URL = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/video/upload"

        if not CLOUD_NAME or not UPLOAD_PRESET:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cloudinary configuration missing",
            )

        # Create multipart form data
        form_data = aiohttp.FormData()
        form_data.add_field("upload_preset", UPLOAD_PRESET)
        form_data.add_field("cloud_name", CLOUD_NAME)
        form_data.add_field("folder", "gait-sessions")

        # Add the video file
        async with aiofiles.open(video_path, "rb") as f:
            form_data.add_field(
                "file",
                await f.read(),
                filename=os.path.basename(video_path),
                content_type="video/mp4",
            )

        async with aiohttp.ClientSession() as session:
            async with session.post(CLOUDINARY_URL, data=form_data) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Cloudinary upload failed: {error_data.get('error', {}).get('message', 'Unknown error')}",
                    )
                data = await response.json()
                return data["secure_url"]

    def create_gait_analysis_prompt(self) -> PromptTemplate:
        """Create and return a PromptTemplate for gait analysis."""
        template = """
    You are a medical expert specialized in gait analysis and prosthetics. Based on the provided patient profile, gait metrics, medical conditions, injuries, and prosthetics (if any), provide a structured response in JSON format. Do not invent or assume data beyond what is provided. If a field cannot be populated due to missing data, use empty arrays (e.g., [] for recommendations, recommended_exercises, long_term_risks).

    **Input Data**:
    - **Patient Profile**:
    - Age: {age}
    - Weight: {weight} kg
    - **Prosthetics**: {prosthetics}
    - **Medical Conditions**: {medical_conditions}
    - **Injuries**: {injuries}
    - **Gait Data**: {gait_data}

    **Questions to Answer**:
    1. What does the gait data reveal about the patient's walking pattern, considering any prosthetics, medical conditions, or injuries?
    2. What abnormalities or issues are present in the gait pattern, and how might they relate to prosthetics, medical conditions, or injuries?
    3. What specific exercises can improve the patient's gait, particularly for symmetry and prosthetic adaptation (if applicable)?
    4. How does the patient's weight influence their gait and prosthetic function (if applicable)?
    5. What are the potential long-term risks or complications associated with the current gait pattern?

    **Output Format**:
    {{
    "detailed_analysis": "...",  // Markdown, comprehensive answers to all questions (at least 500 words), use subheadings for each question, ensure proper formatting, feel free to use bullet points, tables, etc.
    "summary": "...",  // Concise summary (100-200 words) as a plain string
    "possible_abnormalities": ["...", "..."],  // List of specific abnormalities or issues (e.g., "Increased double support time on left side"), empty if none
    "recommendations": ["...", "..."],  // List of specific, medically informed recommendations (e.g., prosthetic adjustments, medical monitoring), empty if none
    "recommended_exercises": ["...", "..."],  // List of specific exercises to improve gait (e.g., "Single-leg stands for 10 minutes daily"), empty if none
    "long_term_risks": ["...", "..."]  // List of potential long-term risks or complications (e.g., "Overuse injury on right side"), empty if none
    }}

    **Instructions**:
    - Return the response strictly as a JSON object. The output must start with {{ and end with }}.
    - Do NOT include any Markdown code block markers like ```json or ``` at the beginning or end of the response. The output must be pure JSON, with no surrounding text or markers.
    - The `detailed_analysis` field must be a single string in Markdown format, addressing each question systematically with subheadings. Ensure all special characters (e.g., newlines, quotes) are properly escaped for JSON (e.g., newlines as \\n, quotes as \\").
    - The `summary`, `recommendations`, `recommended_exercises`, and `long_term_risks` fields must be plain strings or arrays of strings, not Markdown.
    - Recommendations should include actionable steps like prosthetic adjustments, medical consultations, or lifestyle changes.
    - Recommended exercises should be specific, including frequency and duration where applicable.
    - Long-term risks should be concise and specific to the patient's gait, prosthetics, medical conditions, or injuries.
    - If no prosthetics, medical conditions, or injuries are provided, analyze gait assuming a non-prosthetic patient.
    - Do not invent data. If information is missing, note limitations in the analysis and return empty arrays for fields that cannot be populated.
    - Ensure medical accuracy and clarity.
    - The output must be valid JSON, parseable by a JSON parser without errors. Double-check that the response contains no extraneous text, markers, or unescaped characters.
    """
        return PromptTemplate(
            input_variables=[
                "age",
                "weight",
                "prosthetics",
                "medical_conditions",
                "injuries",
                "gait_data",
            ],
            template=template,
        )

    def format_prosthetics(self, prosthetics: List[Dict]) -> str:
        """Format prosthetic data for prompt."""
        if not prosthetics:
            return "No prosthetics for this patient."
        return "\n".join(
            [
                f"- Type: {getattr(p, 'type', 'N/A')}, Side: {getattr(p, 'side', 'N/A')}, "
                f"Material: {getattr(p, 'material', 'N/A')}, Weight: {getattr(p, 'weight', 'N/A')} kg, "
                f"Usage Duration: {getattr(p, 'usage_duration', 'N/A')} months, "
                f"Socket Fit: {getattr(p, 'socket_fit', 'N/A')}, Foot Type: {getattr(p, 'foot_type', 'N/A')}, "
                f"Knee Type: {getattr(p, 'knee_type', 'N/A')}, Activity Level: {getattr(p, 'activity_level', 'N/A')}, "
                f"User Adaptation: {getattr(p, 'user_adaptation', 'N/A')}"
                for p in prosthetics
            ]
        )

    def format_medical_conditions(self, conditions: List[Dict]) -> str:
        """Format medical conditions for prompt."""
        if not conditions:
            return "No medical conditions for this patient."
        return "\n".join(
            [
                f"- Condition: {getattr(c, 'medical_condition_name', 'N/A')}, "
                f"Severity: {getattr(c, 'severity', 'N/A')}, "
                f"Treatment Status: {getattr(c, 'treatment_status', 'N/A')}, "
                f"Details: {getattr(c, 'details', 'N/A')}"
                for c in conditions
            ]
        )

    def format_injuries(self, injuries: List[Dict]) -> str:
        """Format injuries for prompt."""
        if not injuries:
            return "No injuries for this patient."
        return "\n".join(
            [
                f"- Type: {getattr(i, 'injury_type', 'N/A')}, Side: {getattr(i, 'side', 'N/A')}, "
                f"Current Impact: {getattr(i, 'current_impact', 'N/A')}, Details: {getattr(i, 'details', 'N/A')}"
                for i in injuries
            ]
        )

    def strip_markdown_code_block(self, response_content: str) -> str:
        """Remove ```json and ``` markers from the response if present."""
        content = response_content.strip()
        if content.startswith("```json"):
            content = content[len("```json") :].strip()
        if content.endswith("```"):
            content = content[: -len("```")].strip()
        return content

    def ask_gait_analysis(
        self, patient_info: Optional[Dict] = None
    ) -> GaitAnalysisOutput:
        """
        Analyze gait data using LLM and return structured output.

        Args:
            patient_info: Dictionary containing patient details (age, weight, prosthetics, medical_conditions, injuries, gait_data)

        Returns:
            Dictionary containing structured gait analysis output
        """
        # Default patient info
        patient_info = patient_info or {}

        # Extract and format input data
        input_data = {
            "age": patient_info.get("age", "N/A"),
            "weight": patient_info.get("weight", "N/A"),
            "prosthetics": self.format_prosthetics(patient_info.get("prosthetics", [])),
            "medical_conditions": self.format_medical_conditions(
                patient_info.get("medical_conditions", [])
            ),
            "injuries": self.format_injuries(patient_info.get("injuries", [])),
            "gait_data": patient_info.get("gait_data", ""),
        }

        # Initialize components
        llm = self.initialize_llm()
        prompt = self.create_gait_analysis_prompt()

        # Generate response
        chain = prompt | llm
        response = chain.invoke(input_data)

        # Strip any ```json and ``` markers if present
        cleaned_content = self.strip_markdown_code_block(response.content)

        # Parse JSON response
        try:
            output = json.loads(cleaned_content)
        except json.JSONDecodeError as e:
            print("Failed to parse JSON. Cleaned content:", cleaned_content)
            raise ValueError(f"LLM response is not valid JSON: {str(e)}")

        # Validate output structure
        try:
            result = GaitAnalysisOutput(**output)
        except ValueError as e:
            print("Output validation failed. Output:", output)
            raise ValueError(f"Output does not match expected structure: {str(e)}")

        return result
