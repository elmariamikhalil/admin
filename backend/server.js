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

app.get('/maincompany', (req, res) => {
  const sql = 'SELECT Logo FROM maincompany WHERE ID = 1'
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching main company logo:', err)
      return res.status(500).json({ error: 'Failed to fetch main company logo' })
    }
    if (results.length > 0) {
      res.json({ Logo: results[0].Logo })
    } else {
      res.status(404).json({ error: 'Main company logo not found' })
    }
  })
})

// Endpoint to update the main company's logo
app.post('/maincompany/logo', upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const logoFilename = `logo_${Date.now()}${path.extname(req.file.originalname)}`
  const uploadPath = path.join(__dirname, '../public/uploads', logoFilename)

  fs.rename(req.file.path, uploadPath, (err) => {
    if (err) {
      console.error('Error moving file:', err)
      return res.status(500).json({ error: 'Failed to move file' })
    }

    const sql = 'UPDATE maincompany SET Logo = ? WHERE ID = 1'
    pool.query(sql, [logoFilename], (err, result) => {
      if (err) {
        console.error('Error updating logo in database:', err)
        return res.status(500).json({ error: 'Failed to update logo in database' })
      }
      res.status(200).json({ message: 'Logo updated successfully' })
    })
  })
})

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
app.get('/user', (req, res) => {
  const sql = `
    SELECT 
      ID,
      Name,
      email,
      Picture,
      Role,
      Position,
      team
    FROM 
      marabesuser
  `
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err)
      return res.status(500).json({ error: 'Failed to fetch users' })
    }
    res.json(results)
  })
})
// Route for registering a new user
app.post('/user', upload.single('picture'), (req, res) => {
  const { email, password, name, team, role, position } = req.body
  const picture = req.file ? `picture_${Date.now()}-${req.file.originalname}` : null

  if (req.file) {
    const picturePath = req.file.path
    const uploadPath = path.join(__dirname, '../public/uploads', picture)

    fs.rename(picturePath, uploadPath, (err) => {
      if (err) {
        console.error('Error moving file:', err)
        return res.status(500).json({ error: 'Failed to move file' })
      }
      registerUser()
    })
  } else {
    registerUser()
  }

  function registerUser() {
    const checkUserSql = 'SELECT * FROM marabesuser WHERE email = ?'
    pool.query(checkUserSql, [email], (err, results) => {
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

        const insertUserSql =
          'INSERT INTO marabesuser (email, password, Name, team, Role, Position, Picture) VALUES (?, ?, ?, ?, ?, ?, ?)'
        pool.query(
          insertUserSql,
          [email, hash, name, team, role, position, picture],
          (err, result) => {
            if (err) {
              console.error('Error adding user:', err)
              return res.status(500).json({ error: 'Failed to register user' })
            }
            res.status(201).json({ message: 'User registered successfully' })
          },
        )
      })
    })
  }
})
app.get('/user/:id', (req, res) => {
  const { id } = req.params

  const sql = 'SELECT * FROM marabesuser WHERE ID = ?'
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = results[0]
    res.json(user)
  })
})
const updateUserDetails = (userId, details, res) => {
  const { email, name, position, role, picture } = details

  let query = ''
  let values = []

  if (picture) {
    query =
      'UPDATE marabesuser SET email = ?, Name = ?, Position = ?, Role = ?, picture = ? WHERE ID = ?'
    values = [email, name, position, role, picture, userId]
  } else {
    query = 'UPDATE marabesuser SET email = ?, Name = ?, Position = ?, Role = ? WHERE ID = ?'
    values = [email, name, position, role, userId]
  }

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating user:', err)
      return res.status(500).json({ error: 'Failed to update user' })
    }
    res.json({ message: 'User updated successfully' })
  })
}
// Endpoint to update user details
app.put('/user/:ID', upload.single('picture'), (req, res) => {
  const userID = req.params.ID
  const { email, name, position, role } = req.body
  let pictureFilename = null

  if (req.file) {
    const picturePath = req.file.path
    fs.readFile(picturePath, (error, pictureBuffer) => {
      if (error) {
        console.error('Error reading picture file:', error)
        return res.status(500).json({ error: 'Failed to read picture file' })
      }
      const base64Image = pictureBuffer.toString('base64')
      const ext = path.extname(req.file.originalname).toLowerCase()
      logoFilename = `picture_${Date.now()}${ext}`
      const uploadPath = path.join(__dirname, '../public/uploads', logoFilename)
      fs.writeFile(uploadPath, base64Image, 'base64', (err) => {
        if (err) {
          console.error('Error saving picture file:', err)
          return res.status(500).json({ error: 'Failed to save picture file' })
        }
        updateUserDetails(userID, { email, name, position, role, pictureFilename }, res)
      })
    })
  } else {
    updateUserDetails(userID, { email, name, position, role }, res)
  }
})
// Define a route to update a client
const updateClientDetails = (clientId, updatedDetails, res) => {
  let sql = 'UPDATE clients SET ? WHERE ID = ?'
  pool.query(sql, [updatedDetails, clientId], (err, result) => {
    if (err) {
      console.error('Error updating client:', err)
      return res.status(500).json({ error: 'Failed to update client details' })
    }
    res.json({ message: 'Client updated successfully' })
  })
}

// Endpoint to update client details
app.put('/editclient/:ID', upload.single('logo'), (req, res) => {
  const clientId = req.params.ID
  const { Name, Owner, Contact, Category, ProjectID } = req.body
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
      const uploadPath = path.join(__dirname, 'public', 'uploads', logoFilename)
      fs.writeFile(uploadPath, base64Image, 'base64', (err) => {
        if (err) {
          console.error('Error saving picture file:', err)
          return res.status(500).json({ error: 'Failed to save picture file' })
        }
        updateClientDetails(
          clientId,
          { Name, Owner, Contact, Category, ProjectID, Logo: logoFilename },
          res,
        )
      })
    })
  } else {
    updateClientDetails(clientId, { Name, Owner, Contact, Category, ProjectID }, res)
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
app.get('/api/teams', (req, res) => {
  const sql = 'SELECT * FROM marabesteam'
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
app.get('/api/teams/:ID', (req, res) => {
  const userId = req.params.ID
  const sql = 'SELECT * FROM marabesteam WHERE ID = ?'
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
// Fetch team members based on team ID
app.get('/api/teams/:ID/members', (req, res) => {
  const teamId = req.params.ID
  let sql = `SELECT ID, Name, Picture, Position FROM marabesuser WHERE team = ?`
  pool.query(sql, [teamId], (err, results) => {
    if (err) {
      console.error('Error fetching team members:', err)
      return res.status(500).json({ error: 'Failed to fetch team members' })
    }
    res.json(results)
  })
})
// Fetch team associated with the client if exists
app.get('/clientteam/:clientId', (req, res) => {
  const clientId = req.params.clientId
  const sqlSelect = 'SELECT TeamID FROM clientteam WHERE ClientID = ?'
  pool.query(sqlSelect, [clientId], (err, result) => {
    if (err) {
      console.error('Error fetching client team:', err)
      return res.status(500).json({ error: 'Failed to fetch client team' })
    } else {
      if (result.length > 0) {
        res.json({ TeamID: result[0].TeamID })
      } else {
        res.status(404).json({ error: 'Client team not found' })
      }
    }
  })
})

// Route to assign a team to the client
app.post('/clientteam/:clientId', (req, res) => {
  const clientId = req.params.clientId
  const { TeamID } = req.body

  // Check if the client already has a team assigned
  const sqlSelect = 'SELECT TeamID FROM clientteam WHERE ClientID = ?'
  pool.query(sqlSelect, [clientId], (err, result) => {
    if (err) {
      console.error('Error checking client team:', err)
      return res.status(500).json({ error: 'Failed to check client team' })
    }

    if (result.length > 0) {
      // If the client already has a team assigned, update it
      const sqlUpdate = 'UPDATE clientteam SET TeamID = ? WHERE ClientID = ?'
      pool.query(sqlUpdate, [TeamID, clientId], (err, result) => {
        if (err) {
          console.error('Error updating client team:', err)
          return res.status(500).json({ error: 'Failed to update client team' })
        }
        res.json({ message: 'Client team updated successfully' })
      })
    } else {
      // If the client does not have a team assigned, insert new record
      const sqlInsert = 'INSERT INTO clientteam (ClientID, TeamID) VALUES (?, ?)'
      pool.query(sqlInsert, [clientId, TeamID], (err, result) => {
        if (err) {
          console.error('Error assigning team to client:', err)
          return res.status(500).json({ error: 'Failed to assign team to client' })
        }
        res.json({ message: 'Team assigned to client successfully' })
      })
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

//=====================PROJECTS==========================//
// Get all projects
app.get('/projects', (req, res) => {
  pool.query('SELECT * FROM projects', (err, result) => {
    if (err) {
      console.error('Error fetching projects:', err)
      return res.status(500).json({ error: 'Failed to fetch projects' })
    }
    res.json(result)
  })
})

// Get project by ID
app.get('/projects/:id', (req, res) => {
  const { id } = req.params
  pool.query('SELECT * FROM projects WHERE ID = ?', [id], (err, result) => {
    if (err) {
      console.error('Error fetching project:', err)
      return res.status(500).json({ error: 'Failed to fetch project' })
    }
    if (result.length > 0) {
      res.json(result[0])
    } else {
      res.status(404).json({ error: 'Project not found' })
    }
  })
})

// Add new project
app.post('/projects', upload.single('logo'), (req, res) => {
  const { Name } = req.body
  const logoFilename = req.file ? req.file.filename : null
  pool.query(
    'INSERT INTO projects (Name, Logo) VALUES (?, ?)',
    [Name, logoFilename],
    (err, result) => {
      if (err) {
        console.error('Error adding project:', err)
        return res.status(500).json({ error: 'Failed to add project' })
      }
      const newProject = { ID: result.insertId, Name, Logo: logoFilename }
      res.json(newProject)
    },
  )
})

// Update project by ID
app.put('/projects/:id', upload.single('logo'), (req, res) => {
  const { id } = req.params
  const { Name } = req.body
  const logoFilename = req.file ? req.file.filename : null
  pool.query(
    'UPDATE projects SET Name = ?, Logo = ? WHERE ID = ?',
    [Name, logoFilename, id],
    (err, result) => {
      if (err) {
        console.error('Error updating project:', err)
        return res.status(500).json({ error: 'Failed to update project' })
      }
      if (result.affectedRows > 0) {
        res.json({ message: 'Project updated successfully' })
      } else {
        res.status(404).json({ error: 'Project not found' })
      }
    },
  )
})

// Delete project by ID
app.delete('/projects/:id', (req, res) => {
  const { id } = req.params
  pool.query('DELETE FROM projects WHERE ID = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting project:', err)
      return res.status(500).json({ error: 'Failed to delete project' })
    }
    if (result.affectedRows > 0) {
      res.json({ message: 'Project deleted successfully' })
    } else {
      res.status(404).json({ error: 'Project not found' })
    }
  })
})

//=====================FETCH Project Details==========================//
// Get team by project ID
app.get('/projects/:id/team', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM team WHERE project_id = $1', [id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team details' })
  }
})
// Get clients by project ID
app.get('/projects/:id/clients', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM clients WHERE project_id = $1', [id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clients details' })
  }
})
// Get hours details by project ID
app.get('/projects/:id/hours', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'SELECT SUM(signed_hours) as hoursSigned, SUM(fulfilled_hours) as fulfilledHours FROM hours WHERE project_id = $1',
      [id],
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hours details' })
  }
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
