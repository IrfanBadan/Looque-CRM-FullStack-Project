// --- Responsive Employees Component ---
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { Plus, Edit, Trash2, Search, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ROLES = [
  "admin",
  "cashier",
  "sales_executive",
  "event_manager",
  "fashion_designer",
  "tailor",
  "manager",
];

export default function Employees() {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "cashier",
    password: "",
    salary: "",
    salary_per_day: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch Employee List
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // Add Employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      const { error: userError } = await supabase.from("users").insert({
        user_id: authData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        salary: parseFloat(formData.salary) || 0,
        salary_per_day: parseFloat(formData.salary_per_day) || 0,
      });

      if (userError) throw userError;

      setShowAddModal(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        role: "cashier",
        password: "",
        salary: "",
        salary_per_day: "",
      });
      fetchEmployees();
    } catch (error) {
      alert("Failed to add employee: " + error.message);
    }
  };

  // Edit Employee
  const handleEditEmployee = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          salary: parseFloat(formData.salary) || 0,
          salary_per_day: parseFloat(formData.salary_per_day) || 0,
        })
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      alert("Failed to update employee");
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone || "",
      role: employee.role,
      password: "",
      salary: employee.salary || "",
      salary_per_day: employee.salary_per_day || "",
    });
    setShowEditModal(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <UserPlus size={20} />
          Add Employee
        </button>
      </div>

      {/* Card + Table */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Salary</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{employee.full_name}</td>
                  <td className="py-3 px-4">{employee.email}</td>
                  <td className="py-3 px-4">{employee.phone || "-"}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {employee.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">₹{employee.salary || 0}</td>

                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      {userProfile?.role === "admin" && employee.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="border rounded-lg p-4 shadow-sm bg-gray-50"
            >
              <h3 className="font-bold text-lg">{emp.full_name}</h3>

              <p className="text-sm text-gray-600">{emp.email}</p>
              <p className="text-sm">📞 {emp.phone || "-"}</p>

              <p className="mt-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {emp.role}
                </span>
              </p>

              <p className="mt-2 font-semibold">₹ {emp.salary}</p>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => openEditModal(emp)}
                  className="p-2 text-blue-600 bg-white rounded shadow hover:bg-blue-50 flex-1"
                >
                  Edit
                </button>
                {userProfile?.role === "admin" && emp.role !== "admin" && (
                  <button
                    onClick={() => handleDeleteEmployee(emp)}
                    className="p-2 text-red-600 bg-white rounded shadow hover:bg-red-50 flex-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddModal &&
        renderModal("Add Employee", handleAddEmployee, () =>
          setShowAddModal(false)
        )}

      {showEditModal &&
        renderModal("Edit Employee", handleEditEmployee, () => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        })}
    </div>
  );

  // --- Shared Modal Component ---
  function renderModal(title, onSubmit, onCancel) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-5 w-full max-w-md shadow-lg max-h-[85vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{title}</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            {renderInput("Full Name", "full_name")}
            {renderInput("Email", "email", "email")}
            {renderInput("Phone", "phone")}
            {renderSelect("Role", "role")}

            {title === "Add Employee" &&
              renderInput("Password", "password", "password")}

            {renderInput("Salary", "salary", "number")}
            {renderInput("Salary Per Day", "salary_per_day", "number")}

            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                {title.includes("Add")
                  ? "Add Employee"
                  : "Update Employee"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderInput(label, key, type = "text") {
    return (
      <div>
        <label className="block mb-1 text-sm font-medium">{label}</label>
        <input
          type={type}
          required={key !== "phone"}
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          className="w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  function renderSelect(label, key) {
    return (
      <div>
        <label className="block mb-1 text-sm font-medium">{label}</label>
        <select
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          className="w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    );
  }

  async function handleDeleteEmployee(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("users").delete().eq("id", employee.id);
      if (error) throw error;

      setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
      alert("Employee deleted successfully");
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Failed to delete employee: " + err.message);
    }
  }
}
