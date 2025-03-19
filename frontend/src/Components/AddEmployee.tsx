import React, { useState } from "react";
import "../Style/AddEmployee.css"; // Updated CSS file name

interface Employee {
  id: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  password: string;
}

const AddModifyEmployee: React.FC = () => {
  const [isAdding, setIsAdding] = useState<boolean>(true); // Toggle between add and modify
  const [employeeData, setEmployeeData] = useState<Employee>({
    id: "",
    fullName: "",
    position: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState<string>("");

  const generateId = (): string => `EMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const generatePassword = (): string => Math.random().toString(36).substring(2, 10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  const handleAddEmployee = (): void => {
    if (employeeData.fullName && employeeData.position && employeeData.email && employeeData.phone) {
      const newId = generateId();
      const newPassword = generatePassword();
      setEmployeeData({ ...employeeData, id: newId, password: newPassword });
      setMessage(`Employee added successfully! ID: ${newId}, Password: ${newPassword}`);
    } else {
      setMessage("Please fill in all fields to add an employee.");
    }
  };

  const handleModifyEmployee = (): void => {
    if (employeeData.id) {
      setMessage(`Employee with ID: ${employeeData.id} modified successfully!`);
    } else {
      setMessage("Please enter a valid employee ID.");
    }
  };

  const toggleMode = (): void => {
    setIsAdding(!isAdding);
    setEmployeeData({ id: "", fullName: "", position: "", email: "", phone: "", password: "" });
    setMessage("");
  };

  return (
    <div className="employee-form-container">
      <h2 className="employee-form-header">{isAdding ? "Add Employee" : "Modify Employee"}</h2>
      <button className="employee-form-toggle" onClick={toggleMode}>
        Switch to {isAdding ? "Modify" : "Add"} Employee
      </button>

      <div className="employee-form">
        {!isAdding && (
          <div className="employee-form-group">
            <label htmlFor="id">Employee ID</label>
            <input
              type="text"
              id="id"
              name="id"
              placeholder="Enter Employee ID"
              value={employeeData.id}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div className="employee-form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter Full Name"
            value={employeeData.fullName}
            onChange={handleInputChange}
            disabled={!isAdding && !employeeData.id}
          />
        </div>
        <div className="employee-form-group">
          <label htmlFor="position">Position</label>
          <input
            type="text"
            id="position"
            name="position"
            placeholder="Enter Position"
            value={employeeData.position}
            onChange={handleInputChange}
            disabled={!isAdding && !employeeData.id}
          />
        </div>
        <div className="employee-form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Email"
            value={employeeData.email}
            onChange={handleInputChange}
            disabled={!isAdding && !employeeData.id}
          />
        </div>
        <div className="employee-form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Enter Phone Number"
            value={employeeData.phone}
            onChange={handleInputChange}
            disabled={!isAdding && !employeeData.id}
          />
        </div>

        <button
          className="employee-form-submit"
          onClick={isAdding ? handleAddEmployee : handleModifyEmployee}
        >
          {isAdding ? "Add Employee" : "Modify Employee"}
        </button>
      </div>

      {message && <div className="employee-form-message">{message}</div>}
    </div>
  );
};

export default AddModifyEmployee;
