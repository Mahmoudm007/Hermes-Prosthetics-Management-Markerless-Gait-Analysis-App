from fastapi import HTTPException, status
from sqlmodel import select, or_, and_
from sqlmodel.ext.asyncio.session import AsyncSession

from src.patients.service import PatientsService
from src.db.models import Prosthetic
from src.prosthetics.schema import (
    FullProstheticCreateModel,
    ProstheticUpdateModel,
)
from src.db.model.enum import ProstheticType, Side, FingerPosition, ToePosition

patients_service = PatientsService()


class ProstheticsService:
    async def get_prosthetic_by_id(self, id: int, session: AsyncSession) -> Prosthetic:
        statement = select(Prosthetic).where(Prosthetic.id == id)
        result = await session.exec(statement)
        prosthetic = result.first()

        if prosthetic is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prosthetic with this ID does not exist.",
            )

        return prosthetic

    async def validate_prosthetic_data(
        self,
        prosthetic_data,
        session: AsyncSession,
        patient_id: int,
        existing_prosthetic: Prosthetic = None,
        is_update: bool = False,
    ):
        """Validate prosthetic data before creation or update"""
        errors = []

        # Validate side is not Unknown
        if hasattr(prosthetic_data, "side") and prosthetic_data.side == Side.Unknown:
            errors.append("Side cannot be Unknown")

        # Validate date/year mutual exclusivity
        if hasattr(prosthetic_data, "installation_date") and hasattr(
            prosthetic_data, "installation_year"
        ):
            if (
                prosthetic_data.installation_date is not None
                and prosthetic_data.installation_year is not None
            ):
                errors.append(
                    "Cannot provide both installation_date and installation_year"
                )

        # Validate deactivation fields
        if is_update and existing_prosthetic:
            # For updates, determine if is_active is changing
            new_is_active = (
                prosthetic_data.is_active
                if "is_active" in prosthetic_data.model_fields_set
                else existing_prosthetic.is_active
            )

            # Check if deactivation fields are provided in the update
            has_deactivation_date = (
                "deactivation_date" in prosthetic_data.model_fields_set
                and prosthetic_data.deactivation_date is not None
            )
            has_deactivation_year = (
                "deactivation_year" in prosthetic_data.model_fields_set
                and prosthetic_data.deactivation_year is not None
            )

            # If prosthetic is or will be active, deactivation fields should not be provided
            if new_is_active and (has_deactivation_date or has_deactivation_year):
                errors.append(
                    "Cannot provide deactivation_date or deactivation_year for active prosthetics"
                )

            # Cannot provide both deactivation date and year
            if has_deactivation_date and has_deactivation_year:
                errors.append(
                    "Cannot provide both deactivation_date and deactivation_year"
                )
        else:
            is_active = getattr(prosthetic_data, "is_active", True)
            has_deactivation_date = (
                hasattr(prosthetic_data, "deactivation_date")
                and prosthetic_data.deactivation_date is not None
            )
            has_deactivation_year = (
                hasattr(prosthetic_data, "deactivation_year")
                and prosthetic_data.deactivation_year is not None
            )

            if is_active and (has_deactivation_date or has_deactivation_year):
                errors.append(
                    "Cannot provide deactivation_date or deactivation_year for active prosthetics"
                )

            if has_deactivation_date and has_deactivation_year:
                errors.append(
                    "Cannot provide both deactivation_date and deactivation_year"
                )

        # Validate "other" fields
        other_field_pairs = [
            ("type", "other_type"),
            ("alignment", "other_alignment"),
            ("suspension_system", "other_suspension_system"),
            ("foot_type", "other_foot_type"),
            ("knee_type", "other_knee_type"),
            ("pelvic_socket", "other_pelvic_socket"),
            ("material", "other_material"),
            ("control_system", "other_control_system"),
            ("activity_level", "other_activity_level"),
        ]

        for main_field, other_field in other_field_pairs:
            # Determine resulting values
            main_value = (
                getattr(prosthetic_data, main_field)
                if main_field in prosthetic_data.model_fields_set
                else (
                    getattr(existing_prosthetic, main_field)
                    if is_update and existing_prosthetic
                    else None
                )
            )
            other_value = (
                getattr(prosthetic_data, other_field)
                if other_field in prosthetic_data.model_fields_set
                else (
                    getattr(existing_prosthetic, other_field)
                    if is_update and existing_prosthetic
                    else None
                )
            )

            # Validation rules
            if main_value is None:
                if other_value is not None:
                    errors.append(
                        f"If {main_field} is null, {other_field} must be null"
                    )
            elif hasattr(main_value, "value") and main_value.value == "Other":
                if other_value is None:
                    errors.append(
                        f"If {main_field} is 'Other', {other_field} must be provided"
                    )
            else:
                if other_value is not None:
                    errors.append(
                        f"If {main_field} is not 'Other', {other_field} must be null"
                    )

        # Validate type-specific properties
        prosthetic_type = (
            prosthetic_data.type
            if "type" in prosthetic_data.model_fields_set
            else existing_prosthetic.type if is_update and existing_prosthetic else None
        )

        if prosthetic_type:
            # Prevent changing type during update
            if (
                is_update
                and existing_prosthetic
                and "type" in prosthetic_data.model_fields_set
                and prosthetic_type != existing_prosthetic.type
            ):
                errors.append("Cannot change the prosthetic type during update")

            # Define relevant properties for each type
            relevant_properties = {
                ProstheticType.Transtibial: [
                    "residual_limb_length",
                    "foot_type",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                    "shock_absorption_energy",
                ],
                ProstheticType.Transfemoral: [
                    "residual_limb_length",
                    "knee_type",
                    "foot_type",
                    "suspension_system",
                    "control_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                    "shock_absorption_energy",
                ],
                ProstheticType.PartialFoot: [
                    "foot_type",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                ],
                ProstheticType.Syme: [
                    "residual_limb_length",
                    "foot_type",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                    "shock_absorption_energy",
                ],
                ProstheticType.KneeDisarticulation: [
                    "residual_limb_length",
                    "knee_type",
                    "foot_type",
                    "suspension_system",
                    "control_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                    "shock_absorption_energy",
                ],
                ProstheticType.HipDisarticulation: [
                    "pelvic_socket",
                    "knee_type",
                    "foot_type",
                    "suspension_system",
                    "control_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                    "shock_absorption_energy",
                ],
                ProstheticType.Transhumeral: [
                    "residual_limb_length",
                    "control_system",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                ],
                ProstheticType.Transradial: [
                    "residual_limb_length",
                    "control_system",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "grip_strength",
                ],
                ProstheticType.Hand: [
                    "control_system",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "grip_strength",
                ],
                ProstheticType.ShoulderDisarticulation: [
                    "control_system",
                    "suspension_system",
                    "alignment",
                    "socket_fit",
                    "range_of_motion_min",
                    "range_of_motion_max",
                    "stiffness",
                ],
                ProstheticType.Finger: [
                    "residual_limb_length",
                    "finger_position",
                    "alignment",
                    "grip_strength",
                    "range_of_motion_min",
                    "range_of_motion_max",
                ],
                ProstheticType.Toe: [
                    "residual_limb_length",
                    "toe_position",
                    "alignment",
                ],
                ProstheticType.Other: [],  # All properties could be relevant for "Other"
            }

            if prosthetic_type != ProstheticType.Other:
                type_properties = relevant_properties.get(prosthetic_type, [])

                # Special validations for Finger type
                if prosthetic_type == ProstheticType.Finger:
                    finger_position = (
                        prosthetic_data.finger_position
                        if "finger_position" in prosthetic_data.model_fields_set
                        else (
                            existing_prosthetic.finger_position
                            if is_update and existing_prosthetic
                            else None
                        )
                    )
                    if finger_position is None and not is_update:
                        errors.append(
                            "finger_position is required for Finger type prosthetics"
                        )

                # Special validations for Toe type
                if prosthetic_type == ProstheticType.Toe:
                    toe_position = (
                        prosthetic_data.toe_position
                        if "toe_position" in prosthetic_data.model_fields_set
                        else (
                            existing_prosthetic.toe_position
                            if is_update and existing_prosthetic
                            else None
                        )
                    )
                    if toe_position is None and not is_update:
                        errors.append(
                            "toe_position is required for Toe type prosthetics"
                        )
                # Check for irrelevant properties
                all_properties = set()
                for props in relevant_properties.values():
                    all_properties.update(props)

                # Remove common properties that are always relevant
                common_properties = {
                    "type",
                    "side",
                    "weight",
                    "length",
                    "material",
                    "manufacturer",
                    "model",
                    "details",
                    "usage_duration",
                    "installation_date",
                    "installation_year",
                    "is_active",
                    "deactivation_date",
                    "deactivation_year",
                    "patient_id",
                }
                all_properties = all_properties - common_properties

                # Check if any irrelevant property is provided with a value
                for prop in all_properties:
                    if prop not in type_properties and hasattr(prosthetic_data, prop):
                        prop_value = getattr(prosthetic_data, prop)
                        if prop_value is not None:
                            errors.append(
                                f"{prop} is not applicable for {prosthetic_type.value} type prosthetics"
                            )

        # Validate range of motion
        has_min = (
            "range_of_motion_min" in prosthetic_data.model_fields_set
            and prosthetic_data.range_of_motion_min is not None
        ) or (
            is_update
            and existing_prosthetic
            and getattr(existing_prosthetic, "range_of_motion_min") is not None
            and "range_of_motion_min" not in prosthetic_data.model_fields_set
        )
        has_max = (
            "range_of_motion_max" in prosthetic_data.model_fields_set
            and prosthetic_data.range_of_motion_max is not None
        ) or (
            is_update
            and existing_prosthetic
            and getattr(existing_prosthetic, "range_of_motion_max") is not None
            and "range_of_motion_max" not in prosthetic_data.model_fields_set
        )

        if has_min != has_max:
            errors.append(
                "Both range_of_motion_min and range_of_motion_max must be provided together or both must be null"
            )

        if has_min and has_max:
            min_value = (
                prosthetic_data.range_of_motion_min
                if "range_of_motion_min" in prosthetic_data.model_fields_set
                else existing_prosthetic.range_of_motion_min if is_update else None
            )
            max_value = (
                prosthetic_data.range_of_motion_max
                if "range_of_motion_max" in prosthetic_data.model_fields_set
                else existing_prosthetic.range_of_motion_max if is_update else None
            )
            if min_value >= max_value:
                errors.append(
                    "range_of_motion_max must be greater than range_of_motion_min"
                )

        # Validate uniqueness constraints
        side = (
            prosthetic_data.side
            if "side" in prosthetic_data.model_fields_set
            else existing_prosthetic.side if is_update and existing_prosthetic else None
        )
        finger_position = (
            prosthetic_data.finger_position
            if "finger_position" in prosthetic_data.model_fields_set
            else (
                existing_prosthetic.finger_position
                if is_update and existing_prosthetic
                else None
            )
        )
        toe_position = (
            prosthetic_data.toe_position
            if "toe_position" in prosthetic_data.model_fields_set
            else (
                existing_prosthetic.toe_position
                if is_update and existing_prosthetic
                else None
            )
        )

        if prosthetic_type and side:
            check_uniqueness = False
            if is_update and existing_prosthetic:
                new_is_active = (
                    prosthetic_data.is_active
                    if "is_active" in prosthetic_data.model_fields_set
                    else existing_prosthetic.is_active
                )
                check_uniqueness = new_is_active
            else:
                is_active = getattr(prosthetic_data, "is_active", True)
                check_uniqueness = is_active

            if check_uniqueness:
                await self._validate_uniqueness(
                    session,
                    patient_id,
                    prosthetic_type,
                    side,
                    finger_position,
                    toe_position,
                    existing_prosthetic.id if existing_prosthetic else None,
                    errors,
                )

        if errors:
            print(errors)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"errors": errors},
            )

    async def _validate_uniqueness(
        self,
        session: AsyncSession,
        patient_id: int,
        prosthetic_type: ProstheticType,
        side: Side,
        finger_position: FingerPosition = None,
        toe_position: ToePosition = None,
        exclude_id: int = None,
        errors: list = None,
    ):
        """Validate uniqueness constraints for prosthetics"""
        if errors is None:
            errors = []

        if prosthetic_type == ProstheticType.Other:
            return

        query_conditions = [
            Prosthetic.patient_id == patient_id,
            Prosthetic.is_active == True,
        ]

        if exclude_id:
            query_conditions.append(Prosthetic.id != exclude_id)

        if prosthetic_type == ProstheticType.Finger:
            if not finger_position:
                errors.append("finger_position is required for Finger type prosthetics")
                return

            query_conditions.extend(
                [
                    Prosthetic.type == ProstheticType.Finger,
                    Prosthetic.finger_position == finger_position,
                ]
            )

            if side == Side.Bilateral:
                query_conditions.append(
                    or_(
                        Prosthetic.side == Side.Left,
                        Prosthetic.side == Side.Right,
                        Prosthetic.side == Side.Bilateral,
                    )
                )
            else:
                query_conditions.append(
                    or_(Prosthetic.side == side, Prosthetic.side == Side.Bilateral)
                )

        elif prosthetic_type == ProstheticType.Toe:
            if not toe_position:
                errors.append("toe_position is required for Toe type prosthetics")
                return

            query_conditions.extend(
                [
                    Prosthetic.type == ProstheticType.Toe,
                    Prosthetic.toe_position == toe_position,
                ]
            )

            if side == Side.Bilateral:
                query_conditions.append(
                    or_(
                        Prosthetic.side == Side.Left,
                        Prosthetic.side == Side.Right,
                        Prosthetic.side == Side.Bilateral,
                    )
                )
            else:
                query_conditions.append(
                    or_(Prosthetic.side == side, Prosthetic.side == Side.Bilateral)
                )

        else:
            query_conditions.append(Prosthetic.type == prosthetic_type)

            if side == Side.Bilateral:
                query_conditions.append(
                    or_(
                        Prosthetic.side == Side.Left,
                        Prosthetic.side == Side.Right,
                        Prosthetic.side == Side.Bilateral,
                    )
                )
            else:
                query_conditions.append(
                    or_(Prosthetic.side == side, Prosthetic.side == Side.Bilateral)
                )

        statement = select(Prosthetic).where(and_(*query_conditions))
        result = await session.exec(statement)
        existing_prosthetic = result.first()

        if existing_prosthetic:
            if prosthetic_type == ProstheticType.Finger:
                errors.append(
                    f"Patient already has an active {prosthetic_type.value} prosthetic for {finger_position.value} finger on {existing_prosthetic.side.value} side"
                )
            elif prosthetic_type == ProstheticType.Toe:
                errors.append(
                    f"Patient already has an active {prosthetic_type.value} prosthetic for {toe_position.value} toe on {existing_prosthetic.side.value} side"
                )
            else:
                errors.append(
                    f"Patient already has an active {prosthetic_type.value} prosthetic on {existing_prosthetic.side.value} side"
                )

    async def create_prosthetic(
        self,
        prosthetic_data: FullProstheticCreateModel,
        session: AsyncSession,
    ) -> Prosthetic:
        await patients_service.get_patient_by_id(prosthetic_data.patient_id, session)
        await self.validate_prosthetic_data(
            prosthetic_data, session, prosthetic_data.patient_id
        )

        new_prosthetic = Prosthetic(**prosthetic_data.model_dump())
        session.add(new_prosthetic)
        await session.commit()
        return new_prosthetic

    async def update_prosthetic(
        self,
        id: int,
        prosthetic_data: ProstheticUpdateModel,
        session: AsyncSession,
    ) -> Prosthetic:
        prosthetic = await self.get_prosthetic_by_id(id, session)
        await self.validate_prosthetic_data(
            prosthetic_data, session, prosthetic.patient_id, prosthetic, is_update=True
        )

        update_data = prosthetic_data.model_dump(exclude_unset=True)
        is_active_changing = (
            "is_active" in update_data
            and update_data["is_active"] != prosthetic.is_active
        )

        if is_active_changing and update_data["is_active"]:
            update_data["deactivation_date"] = None
            update_data["deactivation_year"] = None

        for key, value in update_data.items():
            setattr(prosthetic, key, value)

        await session.commit()
        await session.refresh(prosthetic)
        return prosthetic

    async def delete_prosthetic(self, id: int, session: AsyncSession) -> Prosthetic:
        prosthetic = await self.get_prosthetic_by_id(id, session)
        await session.delete(prosthetic)
        await session.commit()
        return prosthetic
