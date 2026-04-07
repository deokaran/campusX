import { Request, Response } from 'express';
import Attendance from '../models/attendance.model';
import { v4 as uuidv4 } from 'uuid';

// 🔹 Create Attendance Record
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const attendanceData = {
      _id: uuidv4(),
      ...req.body,
      createdAt: new Date()
    };
    
    const newAttendance = new Attendance(attendanceData);
    await newAttendance.save();

    // Return with 'id' field for frontend compatibility
    const response = {
      id: newAttendance._id,
      classId: newAttendance.classId,
      subjectCode: newAttendance.subjectCode,
      date: newAttendance.date,
      presentStudentIds: newAttendance.presentStudentIds,
      teacherId: newAttendance.teacherId,
      createdAt: newAttendance.createdAt
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ message: 'Error creating attendance record' });
  }
};

// 🔹 Get All Attendance Records
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    
    // Map _id to id for frontend compatibility
    const response = records.map(record => ({
      id: record._id,
      classId: record.classId,
      subjectCode: record.subjectCode,
      date: record.date,
      presentStudentIds: record.presentStudentIds,
      teacherId: record.teacherId,
      createdAt: record.createdAt
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
};

// 🔹 Get Attendance by ID
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Map _id to id for frontend compatibility
    const response = {
      id: record._id,
      classId: record.classId,
      subjectCode: record.subjectCode,
      date: record.date,
      presentStudentIds: record.presentStudentIds,
      teacherId: record.teacherId,
      createdAt: record.createdAt
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance record' });
  }
};

// 🔹 Update Attendance
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const updatedRecord = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Map _id to id for frontend compatibility
    const response = {
      id: updatedRecord._id,
      classId: updatedRecord.classId,
      subjectCode: updatedRecord.subjectCode,
      date: updatedRecord.date,
      presentStudentIds: updatedRecord.presentStudentIds,
      teacherId: updatedRecord.teacherId,
      createdAt: updatedRecord.createdAt
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Error updating attendance record' });
  }
};

// 🔹 Delete Attendance
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const deletedRecord = await Attendance.findByIdAndDelete(req.params.id);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Error deleting attendance record' });
  }
};
