const SUPERADMIN = 'SuperAdmin';
const ADMIN = 'Admin';
const CLIENT = 'Client';

exports.userRoles = {
    SUPERADMIN,
    ADMIN,
    CLIENT
}

// TODO complete the roles
const DOCTOR = 'Doctor';
const ENGINEER = 'Engineer';

exports.memberRoles = {
    DOCTOR,
    ENGINEER
}

const ADMIN_PROMOTION = 'Admin promotion';
const ADMIN_DEMOTION = 'Admin demotion';
const ACCEPT_REQUEST = 'Accept request';

exports.subjects = {
    ADMIN_PROMOTION,
    ADMIN_DEMOTION,
    ACCEPT_REQUEST
}

//const fields = '_id firstName lastName username imgURL role';
const FIELDS = '_id firstName lastName username email imgURL role token hash isVerified notifications teamRequests';
exports.FIELDS = FIELDS;
