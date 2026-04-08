import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Class from '../models/class.model';
import User from '../models/user.model';

const syncTeacherAssignments = (classData: any) => {
  const subjectTeacherIds = (classData.subjects || [])
    .map((subject: any) => typeof subject?.teacherId === 'string' ? subject.teacherId.trim() : '')
    .filter(Boolean);

  classData.teacherIds = [...new Set([...(classData.teacherIds || []), ...subjectTeacherIds])];
};

const syncStudentClassAssignments = async (classId: string, studentIds: string[]) => {
  const uniqueStudentIds = [...new Set((studentIds || []).filter(Boolean))];

  if (uniqueStudentIds.length > 0) {
    await Class.updateMany(
      { _id: { $ne: classId }, studentIds: { $in: uniqueStudentIds } },
      { $pull: { studentIds: { $in: uniqueStudentIds } } }
    );

    await User.updateMany(
      { role: 'S', _id: { $in: uniqueStudentIds } },
      { $set: { 'details.classId': classId } }
    );
  }

  await User.updateMany(
    { role: 'S', _id: { $nin: uniqueStudentIds }, 'details.classId': classId },
    { $unset: { 'details.classId': 1 } }
  );
};

// 🔹 Create Class
export const createClass = async (req: Request, res: Response) => {
  try {
    const classData = { ...req.body };
    syncTeacherAssignments(classData);
    // classId is the custom user-defined string (e.g. "CS-2024-A")
    if (!classData.classId) {
      return res.status(400).json({ message: 'classId is required' });
    }
    // _id: use provided id/classId, or auto-generate
    if (!classData._id) {
      classData._id = classData.id || uuidv4();
    }
    // Remove frontend-only alias
    delete classData.id;

    const newClass = new Class(classData);
    await newClass.save();
    await syncStudentClassAssignments(String(newClass._id), newClass.studentIds || []);

    res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Error creating class', error: String(error) });
  }
};

// 🔹 Get All Classes
export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

// 🔹 Get Class by ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class' });
  }
};

// 🔹 Update Class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    syncTeacherAssignments(updateData);
    // Remove _id and frontend id alias from the update payload to avoid immutable field errors
    // classId is kept so it can be updated if needed
    delete updateData._id;
    delete updateData.id;

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await syncStudentClassAssignments(String(updatedClass._id), updatedClass.studentIds || []);

    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Error updating class', error: String(error) });
  }
};

// 🔹 Delete Class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);

    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await User.updateMany(
      { role: 'S', 'details.classId': req.params.id },
      { $unset: { 'details.classId': 1 } }
    );

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class' });
  }
};
