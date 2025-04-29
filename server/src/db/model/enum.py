from enum import Enum


class AnalysisStatus(str, Enum):
    """Status of the gait analysis."""

    Initial = "Initial"
    Pending = "Pending"
    InProgress = "InProgress"
    Completed = "Completed"
    Error = "Error"


class Sex(str, Enum):
    """Biological sex of the patient."""

    Male = "Male"
    Female = "Female"
    Unknown = "Unknown"


class LimbDominance(str, Enum):
    """Dominant limb of the patient."""

    Left = "Left"
    Right = "Right"
    Ambidextrous = "Ambidextrous"
    Unknown = "Unknown"


class Severity(str, Enum):
    """Severity classification for medical conditions."""

    Mild = "Mild"
    Moderate = "Moderate"
    Severe = "Severe"
    Unknown = "Unknown"


class TreatmentStatus(str, Enum):
    """Current treatment status of the patient."""

    Ongoing = "Ongoing"
    UnderControl = "UnderControl"
    Recovered = "Recovered"
    Untreated = "Untreated"
    Unknown = "Unknown"


class Side(str, Enum):
    """Side of the body affected."""

    Left = "Left"
    Right = "Right"
    Bilateral = "Bilateral"
    Unknown = "Unknown"


class ProstheticType(str, Enum):
    """Prosthetic types with associated properties and body parts."""

    # --- Lower Limb Prostheses ---
    Transtibial = "Transtibial"  # Body Part: tibialis
    # - Properties:
    #   - residual_limb_length (float)
    #   - foot_type (FootType)
    #   - suspension_system (SuspensionSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min foot angle in degrees.
    #   - range_of_motion_max (float): Max foot angle in degrees.
    #   - stiffness (float): Foot stiffness in N/m.
    #   - shock_absorption_energy (float)

    Transfemoral = "Transfemoral"  # Body Part: quadriceps
    # - Properties:
    #   - residual_limb_length (float)
    #   - knee_type (KneeType)
    #   - foot_type (FootType)
    #   - suspension_system (SuspensionSystem)
    #   - control_system (ControlSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min foot angle in degrees.
    #   - range_of_motion_max (float): Max foot angle in degrees.
    #   - stiffness (float): Foot in N/m or knee in Nm/°.
    #   - shock_absorption_energy (float)

    PartialFoot = "PartialFoot"  # Body Part: feet
    # - Properties:
    #   - foot_type (FootType)
    #   - suspension_system (SuspensionSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min foot angle in degrees.
    #   - range_of_motion_max (float): Max foot angle in degrees.
    #   - stiffness (float): Foot stiffness in N/m.

    Syme = "Syme"  # Body Part: ankles
    # - Properties:
    #   - residual_limb_length (float)
    #   - foot_type (FootType)
    #   - suspension_system (SuspensionSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min foot angle in degrees.
    #   - range_of_motion_max (float): Max foot angle in degrees.
    #   - stiffness (float): Foot stiffness in N/m.
    #   - shock_absorption_energy (float)

    KneeDisarticulation = "KneeDisarticulation"  # Body Part: knees
    # - Properties:
    #   - residual_limb_length (float)
    #   - knee_type (KneeType)
    #   - foot_type (FootType)
    #   - suspension_system (SuspensionSystem)
    #   - control_system (ControlSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min foot angle in degrees.
    #   - range_of_motion_max (float): Max foot angle in degrees.
    #   - stiffness (float): Foot in N/m or knee in Nm/°.
    #   - shock_absorption_energy (float)

    HipDisarticulation = "HipDisarticulation"  # Body Part: gluteal
    # - Properties:
    #   - pelvic_socket (PelvicSocket)
    #   - knee_type (KneeType)
    #   - foot_type (FootType)
    #   - suspension_system (SuspensionSystem)
    #   - control_system (ControlSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min foot angle in degrees.
    #   - range_of_motion_max (float): Max foot angle in degrees.
    #   - stiffness (float): Foot in N/m or knee in Nm/°.
    #   - shock_absorption_energy (float)

    # --- Upper Limb Prostheses ---
    Transhumeral = "Transhumeral"  # Body Part: triceps
    # - Properties:
    #   - residual_limb_length (float)
    #   - control_system (ControlSystem)
    #   - suspension_system (SuspensionSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min elbow angle in degrees.
    #   - range_of_motion_max (float): Max elbow angle in degrees.
    #   - stiffness (float): Elbow stiffness in Nm/° or arm structure in N/m.

    Transradial = "Transradial"  # Body Part: forearm
    # - Properties:
    #   - residual_limb_length (float): Length of forearm stump in cm.
    #   - control_system (ControlSystem): Hand/wrist control mechanism.
    #   - suspension_system (SuspensionSystem): Attachment method.
    #   - alignment (Alignment): Hand positioning.
    #   - socket_fit (SocketFit): Fit quality over forearm.
    #   - grip_strength (float): Hand grip strength in N.

    Hand = "Hand"  # Body Part: hands
    # - Properties:
    #   - control_system (ControlSystem): Finger control mechanism.
    #   - suspension_system (SuspensionSystem): Attachment method.
    #   - alignment (Alignment): Finger positioning.
    #   - socket_fit (SocketFit): Fit quality over wrist.
    #   - grip_strength (float): Hand grip strength in N.

    ShoulderDisarticulation = "ShoulderDisarticulation"  # Body Part: deltoids
    # - Properties:
    #   - control_system (ControlSystem)
    #   - suspension_system (SuspensionSystem)
    #   - alignment (Alignment)
    #   - socket_fit (SocketFit)
    #   - range_of_motion_min (float): Min elbow angle in degrees.
    #   - range_of_motion_max (float): Max elbow angle in degrees.
    #   - stiffness (float): Elbow stiffness in Nm/° or arm structure in N/m.

    # --- Digit Prostheses ---
    Finger = "Finger"  # Body Part: None
    # - Properties:
    #   - residual_limb_length (float): Partial only.
    #   - finger_position (FingerPosition)
    #   - alignment (Alignment): Partial only.
    #   - grip_strength (float)
    #   - range_of_motion_min (float): Min finger angle in degrees.
    #   - range_of_motion_max (float): Max finger angle in degrees.

    Toe = "Toe"  # Body Part: None
    # - Properties:
    #   - residual_limb_length (float): Length of toe stump in cm (partial only).
    #   - toe_position (ToePosition): Specific toe replaced.
    #   - alignment (Alignment): Positioning with foot.

    # --- Catch-All ---
    Other = "Other"  # Body Part: None
    # - Properties: Varies based on specific prosthetic.


class Alignment(str, Enum):
    """
    Type of prosthetic alignment used.

    Possible Options:
        - Static: Fixed alignment without adaptability.
        - Dynamic: Adjustable alignment adapting to movement.
        - Other: Any other type of alignment.
    """

    Static = "Static"  # (Static)
    Dynamic = "Dynamic"  # (Dynamic)
    Other = "Other"  # (Other)


class SuspensionSystem(str, Enum):
    """
    Suspension system used in prosthetics.

    - **Body Part**: Associated with lower limb prosthetics.
    - **Has Side**: No
    - **Possible Options**:
        - Suction: Uses suction to hold the prosthesis in place.
        - Vacuum Assisted: Adds vacuum technology for better fit.
        - Pin Lock: Uses a pin locking mechanism.
        - Straps: Traditional straps for suspension.
        - Other: Any other suspension system.
    """

    Suction = "Suction"  # (Suction)
    VacuumAssisted = "VacuumAssisted"  # (Vacuum Assisted)
    PinLock = "PinLock"  # (Pin Lock)
    Straps = "Straps"  # (Straps)
    Other = "Other"  # (Other)


class FootType(str, Enum):
    """
    Type of prosthetic foot used.

    Possible Options:
        - SACH: Solid Ankle Cushion Heel, basic foot type.
        - Dynamic Response: Energy-storing foot with flexibility.
        - Multiaxial: Allows movement in multiple axes.
        - Energy Storing: Stores and returns energy during movement.
        - Microprocessor: Uses microprocessor for adaptive movement.
        - Other: Any other type of foot.
    """

    SACH = "SACH"  # (SACH)
    DynamicResponse = "DynamicResponse"  # (Dynamic Response)
    Multiaxial = "Multiaxial"  # (Multiaxial)
    EnergyStoring = "EnergyStoring"  # (Energy Storing)
    Microprocessor = "Microprocessor"  # (Microprocessor)
    Other = "Other"  # (Other)


class KneeType(str, Enum):
    """
    Type of prosthetic knee used.

    - **Body Part**: Knees
    - **Has Side**: Yes
    - **Possible Options**:
        - Mechanical: Basic mechanical knee joint.
        - Hydraulic: Uses hydraulic fluid for smooth movement.
        - Pneumatic: Uses air pressure for movement.
        - Microprocessor Controlled: Adaptive, intelligent control.
        - Other: Any other type of knee.
    """

    Mechanical = "Mechanical"  # (Mechanical)
    Hydraulic = "Hydraulic"  # (Hydraulic)
    Pneumatic = "Pneumatic"  # (Pneumatic)
    MicroprocessorControlled = "MicroprocessorControlled"  # (Microprocessor Controlled)
    Other = "Other"  # (Other)


class MaterialType(str, Enum):
    """
    Material composition of the prosthetic device.

    Possible Options:
        - Carbon Fiber: Lightweight and durable material.
        - Titanium: Strong and corrosion-resistant metal.
        - Plastic Composite: Mix of plastic for lightweight use.
        - Aluminum: Lightweight metal for mobility.
        - Other: Any other material type.
    """

    CarbonFiber = "CarbonFiber"  # (Carbon Fiber)
    Titanium = "Titanium"  # (Titanium)
    PlasticComposite = "PlasticComposite"  # (Plastic Composite)
    Aluminum = "Aluminum"  # (Aluminum)
    Other = "Other"  # (Other)


class ControlSystem(str, Enum):
    """
    Control system used for prosthetic devices.

    Possible Options:
        - Mechanical: Manually controlled mechanism.
        - Hybrid: Combination of mechanical and electronic control.
        - Microprocessor Controlled: Uses sensors and adaptive technology.
        - Other: Any other control system.
    """

    Mechanical = "Mechanical"  # (Mechanical)
    Hybrid = "Hybrid"  # (Hybrid)
    MicroprocessorControlled = "MicroprocessorControlled"  # (Microprocessor Controlled)
    Other = "Other"  # (Other)


class SocketFit(str, Enum):
    """
    Fit quality of the prosthetic socket.

    Possible Options:
        - Perfect: Ideal fit without discomfort.
        - SlightDiscomfort: Minor discomfort, tolerable.
        - Loose: Not well-fitted, might slip.
        - Painful: Causes pain when used.
        - Unknown: Fit quality not evaluated.
    """

    Perfect = "Perfect"  # (Perfect)
    SlightDiscomfort = "SlightDiscomfort"  # (Slight Discomfort)
    Loose = "Loose"  # (Loose)
    Painful = "Painful"  # (Painful)
    Unknown = "Unknown"  # (Unknown)


class UserAdaptation(str, Enum):
    """User adaptation level to the prosthetic device.

    Possible Options:
        - Poor: Difficulty adapting to the prosthetic.
        - Moderate: Some adaptation, but not complete.
        - Good: Well-adapted to the prosthetic.
        - Excellent: Full adaptation and comfort.
        - Unknown: Adaptation level not evaluated.
    """

    Poor = "Poor"
    Moderate = "Moderate"
    Good = "Good"
    Excellent = "Excellent"
    Unknown = "Unknown"


class ActivityLevel(str, Enum):
    """Activity level of the prosthetic user.

    Possible Options:
        - Low: Minimal physical activity.
        - Moderate: Regular physical activity.
        - High: Intense physical activity.
        - Athletic: Professional athlete level.
        - Other: Any other activity level.
    """

    Low = "Low"
    Moderate = "Moderate"
    High = "High"
    Athletic = "Athletic"
    Other = "Other"


class PelvicSocket(str, Enum):
    """Pelvic Socket Types for Hip Disarticulation Prosthesis"""

    # Rigid socket with minimal flexibility
    Rigid = "Rigid"

    # Flexible socket with rigid frame
    Flexible = "Flexible"

    # Adjustable socket for customizable fit
    Adjustable = "Adjustable"

    # Vacuum-assisted suspension system
    VacuumAssisted = "VacuumAssisted"

    Other = "Other"


class FingerPosition(str, Enum):
    """Enum representing the specific finger for a Finger prosthesis."""

    Thumb = "Thumb"  # Finger 1
    Index = "Index"  # Finger 2
    Middle = "Middle"  # Finger 3
    Ring = "Ring"  # Finger 4
    Pinky = "Pinky"  # Finger 5


class ToePosition(str, Enum):
    """Enum representing the specific toe for a Toe prosthesis."""

    BigToe = "BigToe"  # Toe 1
    SecondToe = "SecondToe"  # Toe 2
    MiddleToe = "MiddleToe"  # Toe 3
    FourthToe = "FourthToe"  # Toe 4
    LittleToe = "LittleToe"  # Toe 5
