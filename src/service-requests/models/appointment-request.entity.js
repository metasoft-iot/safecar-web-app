/**
 * @fileoverview Domain entities for service appointment request management.
 * This file defines the classes that represent the data structure for
 * handling vehicle maintenance appointments in the SafeCar application.
 * 
 * @author SafeCar Development Team
 * @version 1.0.0
 * @since 2025
 */

// ---------------------
// SUBCLASES
// ---------------------

/**
 * Specific details of an appointment request.
 * Contains information about scheduling, requested services, and customer notes.
 * 
 * @class AppointmentRequestDetails
 */
export class AppointmentRequestDetails {
  /**
   * Creates a new instance of AppointmentRequestDetails.
   * 
   * @param {Object} params - Request details parameters
   * @param {string|null} [params.scheduledDate=null] - Scheduled date for the appointment (ISO format)
   * @param {string|null} [params.startTime=null] - Appointment start time
   * @param {string|null} [params.endTime=null] - Appointment end time
   * @param {string|null} [params.requestedService=null] - Type of requested service
   * @param {string|null} [params.requestChannel=null] - Channel through which the request was made (web, mobile, phone)
   * @param {string|null} [params.customerNotes=null] - Additional customer notes
   */
  constructor({
    scheduledDate = null,
    startTime = null,
    endTime = null,
    requestedService = null,
    requestChannel = null,
    customerNotes = null,
  } = {}) {
    /** @type {string|null} Scheduled appointment date */
    this.scheduledDate = scheduledDate;
    /** @type {string|null} Appointment start time */
    this.startTime = startTime;
    /** @type {string|null} Appointment end time */
    this.endTime = endTime;
    /** @type {string|null} Type of requested service */
    this.requestedService = requestedService;
    /** @type {string|null} Request channel */
    this.requestChannel = requestChannel;
    /** @type {string|null} Customer notes */
    this.customerNotes = customerNotes;
  }
}

/**
 * Represents customer information.
 * Contains personal and contact data necessary for appointment management.
 * 
 * @class Customer
 */
export class Customer {
  /**
   * Creates a new instance of Customer.
   * 
   * @param {Object} params - Customer parameters
   * @param {string|null} [params.customerId=null] - Unique customer identifier
   * @param {string|null} [params.firstName=null] - Customer's first name
   * @param {string|null} [params.lastName=null] - Customer's last name
   * @param {string|null} [params.email=null] - Customer's email address
   * @param {string|null} [params.phoneNumber=null] - Phone number
   * @param {string|null} [params.address=null] - Customer's address
   * @param {string|null} [params.registrationDate=null] - Registration date in the system
   */
  constructor({
    customerId = null,
    firstName = null,
    lastName = null,
    email = null,
    phoneNumber = null,
    address = null,
    registrationDate = null,
  } = {}) {
    /** @type {string|null} Unique customer identifier */
    this.customerId = customerId;
    /** @type {string|null} Customer's first name */
    this.firstName = firstName;
    /** @type {string|null} Customer's last name */
    this.lastName = lastName;
    /** @type {string|null} Email address */
    this.email = email;
    /** @type {string|null} Phone number */
    this.phoneNumber = phoneNumber;
    /** @type {string|null} Address */
    this.address = address;
    /** @type {string|null} Registration date */
    this.registrationDate = registrationDate;
  }
}

/**
 * Represents vehicle information.
 * Contains technical specifications and vehicle identification data.
 * 
 * @class Vehicle
 */
export class Vehicle {
  /**
   * Creates a new instance of Vehicle.
   * 
   * @param {Object} params - Vehicle parameters
   * @param {string|null} [params.vehicleId=null] - Unique vehicle identifier
   * @param {string|null} [params.licensePlate=null] - License plate number
   * @param {string|null} [params.brand=null] - Vehicle brand
   * @param {string|null} [params.model=null] - Vehicle models
   * @param {number|null} [params.year=null] - Manufacturing year
   * @param {string|null} [params.fuelType=null] - Fuel type (gasoline, diesel, hybrid, electric)
   * @param {number|null} [params.currentMileage=null] - Current mileage
   */
  constructor({
    vehicleId = null,
    licensePlate = null,
    brand = null,
    model = null,
    year = null,
    fuelType = null,
    currentMileage = null,
  } = {}) {
    /** @type {string|null} Unique vehicle identifier */
    this.vehicleId = vehicleId;
    /** @type {string|null} License plate number */
    this.licensePlate = licensePlate;
    /** @type {string|null} Vehicle brand */
    this.brand = brand;
    /** @type {string|null} Vehicle models */
    this.model = model;
    /** @type {number|null} Manufacturing year */
    this.year = year;
    /** @type {string|null} Fuel type */
    this.fuelType = fuelType;
    /** @type {number|null} Current mileage */
    this.currentMileage = currentMileage;
  }
}

/**
 * Represents mechanic information.
 * Contains professional and contact data of the assigned technician.
 * 
 * @class Mechanic
 */
export class Mechanic {
  /**
   * Creates a new instance of Mechanic.
   * 
   * @param {Object} params - Mechanic parameters
   * @param {string|null} [params.mechanicId=null] - Unique mechanic identifier
   * @param {string|null} [params.fullName=null] - Mechanic's full name
   * @param {string|null} [params.specialization=null] - Technical specialization
   * @param {string|null} [params.contactNumber=null] - Contact number
   * @param {string|null} [params.email=null] - Mechanic's email address
   */
  constructor({
    mechanicId = null,
    fullName = null,
    specialization = null,
    contactNumber = null,
    email = null,
  } = {}) {
    /** @type {string|null} Unique mechanic identifier */
    this.mechanicId = mechanicId;
    /** @type {string|null} Full name */
    this.fullName = fullName;
    /** @type {string|null} Technical specialization */
    this.specialization = specialization;
    /** @type {string|null} Contact number */
    this.contactNumber = contactNumber;
    /** @type {string|null} Email address */
    this.email = email;
  }
}

/**
 * Represents GPS coordinates.
 * Used to store the vehicle's geographical location.
 * 
 * @class GPSCoordinates
 */
export class GPSCoordinates {
  /**
   * Creates a new instance of GPSCoordinates.
   * 
   * @param {Object} params - GPS coordinates parameters
   * @param {number|null} [params.latitude=null] - Latitude in decimal degrees
   * @param {number|null} [params.longitude=null] - Longitude in decimal degrees
   */
  constructor({ latitude = null, longitude = null } = {}) {
    /** @type {number|null} Latitude in decimal degrees */
    this.latitude = latitude;
    /** @type {number|null} Longitude in decimal degrees */
    this.longitude = longitude;
  }
}

/**
 * Represents vehicle telemetry data.
 * Contains real-time information about the vehicle's status obtained from the OBD-II system.
 * 
 * @class VehicleTelemetry
 */
export class VehicleTelemetry {
  /**
   * Creates a new instance of VehicleTelemetry.
   * 
   * @param {Object} params - Vehicle telemetry parameters
   * @param {string|null} [params.lastUpdate=null] - Date and time of last update
   * @param {string|null} [params.obdCode=null] - Detected OBD-II code
   * @param {string|null} [params.faultDescription=null] - Description of detected fault
   * @param {number|null} [params.rpm=null] - Engine revolutions per minute
   * @param {number|null} [params.engineTemperature=null] - Engine temperature in Celsius
   * @param {number|null} [params.fuelLevel=null] - Fuel level (percentage)
   * @param {number|null} [params.oilPressure=null] - Oil pressure
   * @param {number|null} [params.batteryVoltage=null] - Battery voltage
   * @param {Object|null} [params.gpsCoordinates=null] - Vehicle GPS coordinates
   * @param {boolean} [params.activeAlert=false] - Indicates if there are active alerts
   */
  constructor({
    lastUpdate = null,
    obdCode = null,
    faultDescription = null,
    rpm = null,
    engineTemperature = null,
    fuelLevel = null,
    oilPressure = null,
    batteryVoltage = null,
    gpsCoordinates = null,
    activeAlert = false,
  } = {}) {
    /** @type {string|null} Last update date */
    this.lastUpdate = lastUpdate;
    /** @type {string|null} OBD-II code */
    this.obdCode = obdCode;
    /** @type {string|null} Fault description */
    this.faultDescription = faultDescription;
    /** @type {number|null} Engine RPM */
    this.rpm = rpm;
    /** @type {number|null} Engine temperature */
    this.engineTemperature = engineTemperature;
    /** @type {number|null} Fuel level */
    this.fuelLevel = fuelLevel;
    /** @type {number|null} Oil pressure */
    this.oilPressure = oilPressure;
    /** @type {number|null} Battery voltage */
    this.batteryVoltage = batteryVoltage;
    /** @type {GPSCoordinates|null} GPS coordinates */
    this.gpsCoordinates = gpsCoordinates
      ? new GPSCoordinates(gpsCoordinates)
      : null;
    /** @type {boolean} Active alerts status */
    this.activeAlert = activeAlert;
  }
}

// ---------------------
// CLASE PRINCIPAL
// ---------------------

/**
 * Represents a service appointment request.
 * This class encapsulates all necessary information to manage an appointment,
 * including customer details, vehicle, assigned mechanic, and telemetry data.
 * 
 * @class AppointmentRequest
 * @author SafeCar Team
 * @since 1.0.0
 */
export class AppointmentRequest {
  /**
   * Creates a new instance of AppointmentRequest.
   * 
   * @param {Object} params - Parameters to create the appointment request
   * @param {number|null} [params.id=null] - Database unique identifier (primary key)
   * @param {string|null} [params.appointmentId=null] - Unique appointment identifier
   * @param {Object|null} [params.appointmentRequest=null] - Specific request details
   * @param {Object|null} [params.customer=null] - Customer information
   * @param {Object|null} [params.vehicle=null] - Vehicle information
   * @param {Object|null} [params.assignedMechanic=null] - Assigned mechanic information
   * @param {Object|null} [params.vehicleTelemetry=null] - Vehicle telemetry data
   * @param {string|null} [params.status=null] - Current appointment status
   */
  constructor({
    id = null,
    appointmentId = null,
    appointmentRequest = null,
    customer = null,
    vehicle = null,
    assignedMechanic = null,
    vehicleTelemetry = null,
    status = null,
    // Campos adicionales del backend
    startAt = null,
    endAt = null,
    serviceType = null,
    customServiceDescription = null,
    mechanicId = null,
    vehicleId = null,
    driverId = null,
    workshopId = null,
    notes = null,
    driver = null
  } = {}) {
    /** @type {number|null} Database unique identifier */
    this.id = id;
    /** @type {string|null} Unique appointment identifier */
    this.appointmentId = appointmentId;
    /** @type {AppointmentRequestDetails|null} Specific request details */
    this.appointmentDetails = appointmentRequest
      ? new AppointmentRequestDetails(appointmentRequest)
      : (startAt || endAt || serviceType ? new AppointmentRequestDetails({
        scheduledDate: startAt ? startAt.split('T')[0] : null,
        startTime: startAt ? startAt.split('T')[1] : null,
        endTime: endAt ? endAt.split('T')[1] : null,
        requestedService: serviceType === 'CUSTOM' ? customServiceDescription : serviceType,
        requestDate: startAt
      }) : null);
    /** @type {Customer|null} Customer information */
    this.customer = customer ? new Customer(customer)
      : (driver ? new Customer({
        customerId: driverId,
        firstName: driver.fullName ? driver.fullName.split(' ')[0] : '',
        lastName: driver.fullName ? driver.fullName.split(' ').slice(1).join(' ') : '',
        phoneNumber: driver.phone,
        email: driver.email
      }) : null);
    /** @type {Vehicle|null} Vehicle information */
    this.vehicle = vehicle ? new Vehicle(vehicle) : null;
    /** @type {Mechanic|null} Assigned mechanic information */
    this.assignedMechanic = assignedMechanic
      ? new Mechanic(assignedMechanic)
      : null;
    /** @type {VehicleTelemetry|null} Vehicle telemetry data */
    this.vehicleTelemetry = vehicleTelemetry
      ? new VehicleTelemetry(vehicleTelemetry)
      : null;
    /** @type {string|null} Current appointment status */
    this.status = status;

    // Campos adicionales mapeados directamente del backend
    /** @type {string|null} Start timestamp */
    this.startAt = startAt;
    /** @type {string|null} End timestamp */
    this.endAt = endAt;
    /** @type {string|null} Service type */
    this.serviceType = serviceType;
    /** @type {string|null} Custom service description */
    this.customServiceDescription = customServiceDescription;
    /** @type {number|null} Mechanic ID */
    this.mechanicId = mechanicId;
    /** @type {number|null} Vehicle ID */
    this.vehicleId = vehicleId;
    /** @type {number|null} Driver ID (Person Profile ID) */
    this.driverId = driverId;
    /** @type {number|null} Workshop ID */
    this.workshopId = workshopId;
    /** @type {Array|null} Service notes */
    this.serviceNotes = notes || [];
  }
}
