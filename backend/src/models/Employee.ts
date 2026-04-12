import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true, min: 1000 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  date_of_joining: { type: Date, required: true },
  employee_photo: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model('Employee', employeeSchema);
