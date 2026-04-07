import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import classRoutes from './routes/class.routes';
import testRoutes from './routes/test.routes';
import submissionRoutes from './routes/submission.routes';
import resultRoutes from './routes/result.routes';
import receiptRoutes from './routes/receipt.routes';
import eventRoutes from './routes/event.routes';
import chatRoutes from './routes/chat.routes';
import departmentRoutes from './routes/department.routes';
import attendanceRoutes from './routes/attendance.routes'; // 🆕 NEW

const app = express();

// Increase payload limit for base64 images
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes); // 🆕 NEW

export default app;
