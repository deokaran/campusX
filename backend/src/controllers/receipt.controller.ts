import { Request, Response } from 'express';
import Receipt from '../models/receipt.model';
import User from '../models/user.model';

const syncStudentFees = async (studentId: string) => {
  const student = await User.findById(studentId);

  if (!student || student.role !== 'S') {
    return null;
  }

  const receipts = await Receipt.find({ studentId }).select('total');
  const totalPaid = receipts.reduce((sum, receipt) => sum + (Number(receipt.total) || 0), 0);
  const currentDetails =
    student.details && typeof student.details === 'object'
      ? (student.details as Record<string, any>)
      : {};
  const currentFees =
    currentDetails.fees && typeof currentDetails.fees === 'object'
      ? (currentDetails.fees as Record<string, any>)
      : {};
  const totalFees = Number(currentFees.total) || 0;

  student.details = {
    ...currentDetails,
    fees: {
      ...currentFees,
      total: totalFees,
      paid: totalPaid,
      due: Math.max(totalFees - totalPaid, 0)
    }
  };

  await student.save();
  return student;
};

export const createReceipt = async (req: Request, res: Response) => {
  try {
    const { studentId, invoiceNumber, receiptNumber, items, total } = req.body;
    const receiptClass = req.body.class || req.body.classId;

    if (!studentId || !invoiceNumber || !receiptNumber || !items || !total) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['studentId', 'invoiceNumber', 'receiptNumber', 'items', 'total']
      });
    }

    let resolvedClass = typeof receiptClass === 'string' ? receiptClass.trim() : '';

    if (!resolvedClass) {
      const student = await User.findById(studentId).select('details');
      const studentDetails = student?.details as { classId?: string; yearSem?: string } | undefined;
      resolvedClass = studentDetails?.classId?.trim() || studentDetails?.yearSem?.trim() || '';
    }

    if (!resolvedClass) {
      return res.status(400).json({
        message: 'Class is required',
        required: ['class']
      });
    }

    const existingReceipt = await Receipt.findOne({ receiptNumber });
    if (existingReceipt) {
      return res.status(400).json({
        message: 'Receipt number already exists',
        receiptNumber
      });
    }

    const newReceipt = new Receipt({
      ...req.body,
      class: resolvedClass
    });

    await newReceipt.save();
    await syncStudentFees(studentId);

    res.status(201).json(newReceipt);
  } catch (error: any) {
    console.error('Error creating receipt:', error);
    res.status(500).json({
      message: 'Error creating receipt',
      error: error.message
    });
  }
};

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const receipts = await Receipt.find();
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipts' });
  }
};

export const getReceiptById = async (req: Request, res: Response) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipt' });
  }
};

export const getReceiptsByStudent = async (req: Request, res: Response) => {
  try {
    const receipts = await Receipt.find({ studentId: req.params.studentId });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student receipts' });
  }
};

export const updateReceipt = async (req: Request, res: Response) => {
  try {
    const existingReceipt = await Receipt.findById(req.params.id);

    if (!existingReceipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const updatedReceipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (updatedReceipt?.studentId) {
      await syncStudentFees(updatedReceipt.studentId);
    }

    if (existingReceipt.studentId && existingReceipt.studentId !== updatedReceipt?.studentId) {
      await syncStudentFees(existingReceipt.studentId);
    }

    res.json(updatedReceipt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating receipt' });
  }
};

export const deleteReceipt = async (req: Request, res: Response) => {
  try {
    const deletedReceipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!deletedReceipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    await syncStudentFees(deletedReceipt.studentId);

    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting receipt' });
  }
};
