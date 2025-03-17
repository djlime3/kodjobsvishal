const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Helper function to read users.json
async function readUsersFile() {
  try {
    const data = await fs.readFile('users.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, return empty users array
      return { users: [] };
    }
    throw error;
  }
}

// Helper function to write to users.json
async function writeUsersFile(data) {
  await fs.writeFile('users.json', JSON.stringify(data, null, 2), 'utf8');
}

// Helper function to get the next available ID
async function getNextUserId() {
  const data = await readUsersFile();
  if (!data.users || data.users.length === 0) return 1;
  
  // Find the highest numeric ID
  const maxId = data.users.reduce((max, user) => {
    if (!user.id) return max;
    
    // Convert any ID format to a number
    let numId;
    if (typeof user.id === 'number') {
      numId = user.id;
    } else if (typeof user.id === 'string') {
      // Extract numeric part from string IDs like "id123"
      const matches = user.id.match(/\d+/);
      numId = matches ? parseInt(matches[0]) : 0;
    } else {
      numId = 0;
    }
    
    return Math.max(max, numId);
  }, 0);
  
  return maxId + 1;
}

// Helper function to fix users without IDs
async function fixUsersWithoutIds() {
  const data = await readUsersFile();
  if (!data.users || data.users.length === 0) return;

  let hasChanges = false;
  let nextId = 1;

  // Find the highest existing ID
  const maxId = data.users.reduce((max, user) => {
    if (user.id && typeof user.id === 'number') {
      return Math.max(max, user.id);
    }
    return max;
  }, 0);
  
  nextId = maxId + 1;

  // Fix users without IDs
  data.users = data.users.map(user => {
    if (!user.id) {
      hasChanges = true;
      return { ...user, id: nextId++ };
    }
    
    // Convert string IDs to numbers
    if (typeof user.id === 'string') {
      hasChanges = true;
      const matches = user.id.match(/\d+/);
      const numId = matches ? parseInt(matches[0]) : nextId++;
      return { ...user, id: numId };
    }
    
    return user;
  });

  // Save changes if needed
  if (hasChanges) {
    console.log('Fixed users without IDs');
    await writeUsersFile(data);
  }
}

// Run the fix when server starts
fixUsersWithoutIds().catch(console.error);

// Endpoint to handle user registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, dob } = req.body;
    const usersFilePath = path.join(__dirname, 'users.json');
    
    // Read existing users
    let userData = { users: [] };
    try {
      const fileContent = await fs.readFile(usersFilePath, 'utf-8');
      userData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, use default empty array
    }

    // Check if username already exists
    const existingUser = userData.users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists',
        field: 'username'
      });
    }

    // Get next available ID
    const nextId = await getNextUserId();
    console.log('Generated ID for new user:', nextId);

    // Calculate age
    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    // Create new user with numeric ID
    const newUser = {
      id: nextId,
      username,
      password,
      email,
      dob,
      age: calculateAge(dob)
    };

    // Add new user to array
    userData.users.push(newUser);

    // Save updated data
    await fs.writeFile(usersFilePath, JSON.stringify(userData, null, 2), 'utf-8');

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { ...newUser, password: undefined }
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Error during registration' });
  }
});

// Endpoint to verify login credentials
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Read existing users
    const data = await readUsersFile();

    // Find matching user
    const user = data.users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      // Create a safe user object without password
      const { password: _, ...safeUserData } = user;
      
      console.log('Login successful for user:', username); // Add logging
      
      return res.json({ 
        success: true,
        message: 'Login successful',
        user: safeUserData
      });
    } else {
      console.log('Login failed for user:', username); // Add logging
      
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error during login. Please try again.'
    });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, email, dob } = req.body;

    // Validate required fields
    if (!username || !password || !email || !dob) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Read existing users
    const data = await readUsersFile();

    // Check if username or email already exists
    const userExists = data.users.some(
      user => user.username === username || user.email === email
    );

    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Get next available ID as a simple number
    const nextId = await getNextUserId();
    console.log('Generated ID for new user:', nextId);

    // Calculate age
    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    // Add new user with numeric ID
    const newUser = {
      id: nextId, // Store as a simple number
      username,
      password,
      email,
      dob,
      age: calculateAge(dob)
    };

    console.log('New user object:', newUser);
    data.users.push(newUser);

    // Save updated users
    await writeUsersFile(data);

    res.status(201).json({ 
      message: 'User created successfully',
      user: { ...newUser, password: undefined }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 