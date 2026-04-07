import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';

// 🔹 Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// 🔹 Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

// 🔹 Create single user
export const createUser = async (req: Request, res: Response) => {
  try {
    console.log('Creating user:', req.body);
    
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findById(userData._id || userData.id);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this ID already exists' });
    }

    // Build name from firstName, middleName, lastName
    const name = `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
    
    // Hash password (use provided or default)
    const rawPassword = userData.password || process.env.DEFAULT_PASSWORD || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create user with proper structure
    const newUser = new User({
      _id: userData._id || userData.id,
      name: name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      details: userData.details || {}
    });

    await newUser.save();
    
    console.log('User created successfully:', newUser._id);

    // Return without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// 🔹 Bulk add users
export const bulkAddUsers = async (req: Request, res: Response) => {
  try {
    const users = req.body; // array of users

    console.log(`Bulk adding ${users.length} users`);

    const formattedUsers = await Promise.all(
      users.map(async (user: any) => {
        const name = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();
        const rawPassword = user.password || process.env.DEFAULT_PASSWORD || 'password123';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        return {
          _id: user._id || user.id,
          name: name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          details: user.details || {}
        };
      })
    );

    const result = await User.insertMany(formattedUsers);

    console.log(`Successfully added ${result.length} users`);

    res.status(201).json({
      message: 'Users added successfully',
      count: result.length
    });

  } catch (error) {
    console.error('Error bulk adding users:', error);
    res.status(500).json({ message: 'Error adding users', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// 🔹 Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    console.log('Updating user:', req.params.id);
    
    const userData = req.body;
    
    // Build name if firstName/lastName provided
    if (userData.firstName || userData.lastName) {
      userData.name = `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
    }
    
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      userData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', updatedUser._id);

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// 🔹 Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    console.log('Deleting user:', req.params.id);
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User deleted successfully:', req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
