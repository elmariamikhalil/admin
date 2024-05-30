const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')

const app = express()

// MySQL database connection
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust this value based on your requirements
  host: '82.197.82.15',
  user: 'u291024398_marabes',
  password: 'Marabes2024@',
  database: 'u291024398_marabes',
})

// JWT Secret Key
const JWT_SECRET =
  'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJwYXNzd29yZCI6IlBhc3N3b3JkIiwibmFtZSI6Ik5hbWUiLCJlbWFpbCI6IkVtYWlsIn0.jfgMNV-QwvnfwqmDL4b2k6xDkrsedV2ryFUEsIy00l8'

// Middleware
app.use(cors())
app.use(express.json()) // for parsing application/json
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'))) // Serve uploaded files

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})
const upload = multer({ storage: storage })

app.get('/projects', (req, res) => {
  const sql = 'SELECT ID, Name, Logo FROM projects'
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching projects:', err)
      return res.status(500).json({ error: 'Failed to fetch projects' })
    }
    res.json(result)
  })
})
// Route for uploading logo and adding a new client
const insertClientToDB = (Name, Owner, Contact, Category, logo, ProjectID, res) => {
  const sql =
    'INSERT INTO clients (Name, Owner, Contact, Category, logo, ProjectID) VALUES (?, ?, ?, ?, ?, ?)'
  pool.query(sql, [Name, Owner, Contact, Category, logo, ProjectID], (err, result) => {
    if (err) {
      console.error('Error adding client:', err)
      return res.status(500).json({ error: 'Failed to add client' })
    }
    res.status(201).json({ message: 'Client added successfully' })
  })
}
app.post('/addclient', upload.single('logo'), (req, res) => {
  const { Name, Owner, Contact, Category, ProjectID } = req.body
  const logoFilename = req.file ? `logo_${Date.now()}${path.extname(req.file.originalname)}` : null

  if (req.file) {
    const picturePath = req.file.path
    const uploadPath = path.join(__dirname, '../public/uploads', logoFilename)

    fs.rename(picturePath, uploadPath, (err) => {
      if (err) {
        console.error('Error moving file:', err)
        return res.status(500).json({ error: 'Failed to move file' })
      }
      insertClientToDB(Name, Owner, Contact, Category, logoFilename, ProjectID, res)
    })
  } else {
    insertClientToDB(Name, Owner, Contact, Category, null, ProjectID, res)
  }
})

// Route for getting all clients
app.get('/clients', (req, res) => {
  const sql = 'SELECT * FROM clients'
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching clients:', err)
      res.status(500).send('Internal Server Error')
    } else {
      res.json(result)
    }
  })
})

// Route for getting a specific client by ID
app.get('/clients/:ID', (req, res) => {
  const clientId = req.params.ID
  const sql = 'SELECT * FROM clients WHERE ID = ?'
  pool.query(sql, [clientId], (err, result) => {
    if (err) {
      console.error('Error fetching client:', err)
      res.status(500).send('Internal Server Error')
    } else if (result.length === 0) {
      res.status(404).send('Client not found')
    } else {
      res.json(result[0])
    }
  })
})

// Route for registering a new user
app.post('/user', (req, res) => {
  const { email, password, name } = req.body

  const sql = 'SELECT * FROM users WHERE email = ?'
  pool.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err)
        return res.status(500).json({ error: 'Failed to register user' })
      }

      const sql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
      pool.query(sql, [email, hash, name], (err, result) => {
        if (err) {
          console.error('Error adding user:', err)
          return res.status(500).json({ error: 'Failed to register user' })
        }
        res.status(201).json({ message: 'User registered successfully' })
      })
    })
  })
})

// Define a route to update a client
const updateClientDetails = (clientId, details, res) => {
  const { Name, Owner, Contact, Category, logo } = details

  let query = ''
  let values = []

  if (logo) {
    query =
      'UPDATE clients SET Name = ?, Owner = ?, Contact = ?, Category = ?, logo = ? WHERE ID = ?'
    values = [Name, Owner, Contact, Category, logo, clientId]
  } else {
    query = 'UPDATE clients SET Name = ?, Owner = ?, Contact = ?, Category = ? WHERE ID = ?'
    values = [Name, Owner, Contact, Category, clientId]
  }

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating client:', err)
      return res.status(500).json({ error: 'Failed to update client' })
    }
    res.json({ message: 'Client updated successfully' })
  })
}

// Endpoint to update client details
app.put('/editclient/:ID', upload.single('logo'), (req, res) => {
  const clientId = req.params.ID
  const { Name, Owner, Contact, Category } = req.body
  let logoFilename = null

  if (req.file) {
    const picturePath = req.file.path
    fs.readFile(picturePath, (error, pictureBuffer) => {
      if (error) {
        console.error('Error reading picture file:', error)
        return res.status(500).json({ error: 'Failed to read picture file' })
      }
      const base64Image = pictureBuffer.toString('base64')
      const ext = path.extname(req.file.originalname).toLowerCase()
      logoFilename = `logo_${Date.now()}${ext}`
      const uploadPath = path.join(__dirname, '../public/uploads', logoFilename)
      fs.writeFile(uploadPath, base64Image, 'base64', (err) => {
        if (err) {
          console.error('Error saving picture file:', err)
          return res.status(500).json({ error: 'Failed to save picture file' })
        }
        updateClientDetails(clientId, { Name, Owner, Contact, Category, logo: logoFilename }, res)
      })
    })
  } else {
    updateClientDetails(clientId, { Name, Owner, Contact, Category }, res)
  }
})

// Route for authenticating a user
app.post('/user/authenticate', (req, res) => {
  const { email, password } = req.body

  const sql = 'SELECT * FROM users WHERE email = ?'
  pool.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    bcrypt.compare(password, results[0].password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      const token = jwt.sign({ id: results[0].id, email: results[0].email }, JWT_SECRET, {
        expiresIn: '1h',
      })

      res.json({ token })
    })
  })
})

// Route for getting all users
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users'
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching users:', err)
      res.status(500).send('Internal Server Error')
    } else {
      res.json(result)
    }
  })
})

// Fetch details of a specific user by ID
app.get('/users/:id', (req, res) => {
  const userId = req.params.id
  const sql = 'SELECT * FROM users WHERE id = ?'
  pool.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user:', err)
      res.status(500).json({ error: 'Server error' })
    } else if (result.length === 0) {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.json(result[0])
    }
  })
})

// Delete a client by ID
app.delete('/clients/:id', (req, res) => {
  const clientId = req.params.id
  const sql = 'DELETE FROM clients WHERE ID = ?'
  pool.query(sql, [clientId], (err, result) => {
    if (err) {
      console.error('Error deleting client:', err)
      res.status(500).json({ error: 'Server error' })
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Client not found' })
    } else {
      res.json({ message: 'Client deleted successfully' })
    }
  })
})

// Route to add a new Marabes Team member
app.post('/marabesteam', (req, res) => {
  const { name, role, contact } = req.body

  const sql = 'INSERT INTO marabesteam (name, role, contact) VALUES (?, ?, ?)'
  pool.query(sql, [name, role, contact], (err, result) => {
    if (err) {
      console.error('Error adding team member:', err)
      res.status(500).json({ error: 'Server error' })
    } else {
      res.status(201).json({ message: 'Team member added successfully' })
    }
  })
})

// Route to get all Marabes Team members
app.get('/marabesteam', (req, res) => {
  const sql = 'SELECT * FROM marabesteam'
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching team members:', err)
      res.status(500).json({ error: 'Server error' })
    } else {
      res.json(result)
    }
  })
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
