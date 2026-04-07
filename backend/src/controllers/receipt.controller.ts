import { Request, Response } from 'express';
import Receipt from '../models/receipt.model';

// 🔹 Create Receipt
export const createReceipt = async (req: Request, res: Response) => {
  try {
    const newReceipt = new Receipt(req.body);
    await newReceipt.save();

    res.status(201).json(newReceipt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating receipt' });
  }
};

// 🔹 Get All Receipts
export const getReceipts = async (req: Request, res: Response) => {
  try {
    const receipts = await Receipt.find();
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipts' });
  }
};

// 🔹 Get Receipt by ID
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

// 🔹 Get Receipts by Student
export const getReceiptsByStudent = async (req: Request, res: Response) => {
  try {
    const receipts = await Receipt.find({ studentId: req.params.studentId });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student receipts' });
  }
};

// 🔹 Update Receipt
export const updateReceipt = async (req: Request, res: Response) => {
  try {
    const updatedReceipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedReceipt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating receipt' });
  }
};

// 🔹 Delete Receipt
export const deleteReceipt = async (req: Request, res: Response) => {
  try {
    await Receipt.findByIdAndDelete(req.params.id);

    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting receipt' });
  }
};