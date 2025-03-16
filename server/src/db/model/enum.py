from enum import Enum


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
    """Types of prosthetics available."""

    Transtibial = "Transtibial"
    Transfemoral = "Transfemoral"
    PartialFoot = "PartialFoot"
    Syme = "Syme"
    HipDisarticulation = "HipDisarticulation"
    KneeDisarticulation = "KneeDisarticulation"
    ArmProsthesis = "ArmProsthesis"
    Other = "Other"


class Alignment(str, Enum):
    """Type of prosthetic alignment used."""

    Static = "Static"
    Dynamic = "Dynamic"
    Other = "Other"


class SuspensionSystem(str, Enum):
    """Suspension system used in prosthetics."""

    Suction = "Suction"
    VacuumAssisted = "VacuumAssisted"
    PinLock = "PinLock"
    Straps = "Straps"
    Other = "Other"


class FootType(str, Enum):
    """Type of prosthetic foot used."""

    SACH = "SACH"
    DynamicResponse = "DynamicResponse"
    Multiaxial = "Multiaxial"
    EnergyStoring = "EnergyStoring"
    Microprocessor = "Microprocessor"
    Other = "Other"


class KneeType(str, Enum):
    """Type of prosthetic knee used."""

    Mechanical = "Mechanical"
    Hydraulic = "Hydraulic"
    Pneumatic = "Pneumatic"
    MicroprocessorControlled = "MicroprocessorControlled"
    Other = "Other"


class MaterialType(str, Enum):
    """Material composition of the prosthetic device."""

    CarbonFiber = "CarbonFiber"
    Titanium = "Titanium"
    PlasticComposite = "PlasticComposite"
    Aluminum = "Aluminum"
    Other = "Other"


class ControlSystem(str, Enum):
    """Control system used for prosthetic devices."""

    Mechanical = "Mechanical"
    Hybrid = "Hybrid"
    MicroprocessorControlled = "MicroprocessorControlled"
    Other = "Other"


class UserAdaptation(str, Enum):
    """User adaptation level to the prosthetic device."""

    Poor = "Poor"
    Moderate = "Moderate"
    Good = "Good"
    Excellent = "Excellent"
    Unknown = "Unknown"


class SocketFit(str, Enum):
    """Fit quality of the prosthetic socket."""

    Perfect = "Perfect"
    SlightDiscomfort = "SlightDiscomfort"
    Loose = "Loose"
    Painful = "Painful"
    Unknown = "Unknown"


class ProstheticStiffness(str, Enum):
    """Stiffness level of the prosthetic limb."""

    Low = "Low"
    Medium = "Medium"
    High = "High"
    Unknown = "Unknown"


class ActivityLevel(str, Enum):
    """Activity level of the prosthetic user."""

    Low = "Low"
    Moderate = "Moderate"
    High = "High"
    Athletic = "Athletic"
    Other = "Other"
