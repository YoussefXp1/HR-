import React, { useState } from "react";
import "../Style/AddEmployee.css";

interface Employee {
  id: string;
  position: string;
}

const AddModifyDeleteEmployee: React.FC = () => {
  const [mode, setMode] = useState<"add" | "modify" | "delete">("add");
  const [employeeData, setEmployeeData] = useState<Employee>({
    id: "",
    position: "",
  });
  const [addEmployeeData, setAddEmployeeData] = useState({
    fullName: "",
    position: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState<string>("");

  const [confirmationInput, setConfirmationInput] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (mode === "add") {
      setAddEmployeeData({ ...addEmployeeData, [name]: value });
    } else {
      setEmployeeData({ ...employeeData, [name]: value });
    }
  };

  const handleAddEmployee = async (): Promise<void> => {
    if (
      addEmployeeData.fullName &&
      addEmployeeData.position &&
      addEmployeeData.email &&
      addEmployeeData.phone
    ) {

      const phoneDigitsOnly = addEmployeeData.phone.replace(/\D/g, ""); // remove non-digits
    if (phoneDigitsOnly.length !== 10) {
      setMessage("⚠️ Phone number must be exactly 10 digits.");
      return;
    }

      const employeeToSend = {
        fullName: addEmployeeData.fullName,
        position: addEmployeeData.position,
        email: addEmployeeData.email,
        phone: addEmployeeData.phone,
      };

      try {
        const response = await fetch("http://localhost:5122/api/hr/add-employee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(employeeToSend),
        });

        //const data = await response.json();
        if (response.ok) {
          const data = await response.json();
          setMessage("✅ Employee added and password sent via email!");
          setAddEmployeeData({
            fullName: "",
            position: "",
            email: "",
            phone: "",
          });
        } else {
          const errorText = await response.text(); // safer than response.json() for 500
          console.error("Backend error:", errorText);
          setMessage("❌ Failed to add employee. Details logged.");
        }
      } catch (error) {
        console.error("Add employee error:", error);
        setMessage("❌ An error occurred while adding the employee.");
      }
    } else {
      setMessage("⚠️ Please fill in all fields to add an employee.");
    }
  };

  const handleModifyEmployee = async (): Promise<void> => {
    if (!employeeData.id || !employeeData.position) {
      setMessage("❌ Please enter both Employee ID and new Position.");
      return;
    }

    try {
      const updateResponse = await fetch(`http://localhost:5122/api/employee/update-position/${employeeData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPosition: employeeData.position }),
      });

      const updateData = await updateResponse.json();
      if (updateResponse.ok) {
        setMessage("✅ Employee position updated successfully!");
        setEmployeeData({
          id: "",
          position: "",
        });
      } else {
        setMessage(updateData.message || "❌ Failed to update position.");
      }
    } catch (error) {
      console.error("Modify employee error:", error);
      setMessage("❌ An error occurred while modifying the employee.");
    }
  };

  const handleDeleteEmployee = async (): Promise<void> => {
    if (!employeeData.id) {
      setMessage("❌ Please enter a valid Employee ID to delete.");
      return;
    }

    try {
      const deleteResponse = await fetch(`http://localhost:5122/api/employee/delete/${employeeData.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (deleteResponse.ok) {
        setMessage("✅ Employee deleted successfully!");
        setEmployeeData({
          id: "",
          position: "",
        });
      } else {
        const deleteData = await deleteResponse.json();
        setMessage(deleteData.message || "❌ Failed to delete employee.");
      }
    } catch (error) {
      console.error("Delete employee error:", error);
      setMessage("❌ An error occurred while deleting the employee.");
    }
  };

  const handleSubmit = () => {
    if (mode === "add") {
      handleAddEmployee();
    } else if (mode === "modify") {
      handleModifyEmployee();
    } else if (mode === "delete") {
      handleDeleteEmployee();
    }
  };

  const switchMode = (newMode: "add" | "modify" | "delete") => {
    setMode(newMode);
    setMessage("");
    setEmployeeData({
      id: "",
      position: "",
    });
    setAddEmployeeData({
      fullName: "",
      position: "",
      email: "",
      phone: "",
    });
  };

  return (
    <div className="employee-form-container">
      <h2 className="employee-form-header">
        {mode === "add" ? "Add Employee" : mode === "modify" ? "Modify Position" : "Delete Employee"}
      </h2>

      <div className="employee-form-toggle-buttons">
        <button className="employee-form-button add" onClick={() => switchMode("add")}>Add</button>
        <button className="employee-form-button modify" onClick={() => switchMode("modify")}>Modify</button>
        <button className="employee-form-button delete" onClick={() => switchMode("delete")}>Delete</button>
      </div>

      <div className="employee-form">
        {mode === "add" && (
          <>
            <div className="employee-form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter Full Name"
                value={addEmployeeData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="employee-form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                placeholder="Enter Position"
                value={addEmployeeData.position}
                onChange={handleInputChange}
              />
            </div>
            <div className="employee-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Email"
                value={addEmployeeData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="employee-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter Phone Number"
                value={addEmployeeData.phone}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {mode !== "add" && (
          <>
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
          </>
        )}

      {mode === "delete" && (
      <div className="employee-form-group">
      <label htmlFor="confirmation">Type "Apply" To Confirm Deletion</label>
      <input
          type="text"
          id="confirmation"
          name="confirmation"
          placeholder='Type "Apply" here'
          value={confirmationInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmationInput(e.target.value)}
        />
        </div>
        )}


        {mode === "modify" && (
          <div className="employee-form-group">
            <label htmlFor="position">New Position</label>
            <input
              type="text"
              id="position"
              name="position"
              placeholder="Enter New Position"
              value={employeeData.position}
              onChange={handleInputChange}
            />
          </div>
        )}

        <button
          className="employee-form-submit"
          onClick={handleSubmit}
          disabled={mode === "delete" && confirmationInput !== "Apply"}

        >
          {mode === "add" ? "Add Employee" : mode === "modify" ? "Modify Position" : "Delete Employee"}
        </button>
      </div>

      {message && <div className="employee-form-message">{message}</div>}
    </div>
  );
};

export default AddModifyDeleteEmployee;
