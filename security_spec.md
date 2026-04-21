# Security Specification - CareFlow PMS

## Data Invariants
- A patient record must have a unique ID.
- Status follows a strict linear path: `pending_consultation` -> `pending_meal` -> `complete`.
- Patients must have a registrar ID on creation.
- Only the assigned role can move a patient to the next stage.

## User Roles
- `admin`: Full access.
- `registrar`: Can create patients. Can update before consultation.
- `consultant`: Can update patients with status `pending_consultation`. Must provide `consultantAdvice` and `consultantImageUrl`.
- `meal_distributor`: Can update patients with status `pending_meal`. Must provide `mealImageUrl`.

## Firestore Paths
- `/users/{userId}`: Profile with `role`.
- `/patients/{patientId}`: Patient records.

## Security Rules (Pillars)
1. **Master Gate**: All reads/writes require valid auth and specific roles.
2. **Validation Blueprints**: `isValidPatient` helper checks field types and sizes.
3. **Identity Integrity**: `authorId` fields must match `request.auth.uid`.
4. **Action-Based Updates**: Updating `status` or specialized notes is restricted by role and current state.
