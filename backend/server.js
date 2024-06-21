const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bodyParser = require('body-parser')
const app = express()

// MySQL database connection
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust this value based on your requirements
  host: '82.197.82.15',
  user: 'u291024398_marabes',
  password: 'Marabes2024@',
  database: 'u291024398_marabes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// JWT Secret Key
const JWT_SECRET =
  'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJwYXNzd29yZCI6IlBhc3N3b3JkIiwibmFtZSI6Ik5hbWUiLCJlbWFpbCI6IkVtYWlsIn0.jfgMNV-QwvnfwqmDL4b2k6xDkrsedV2ryFUEsIy00l8'

// Middleware
app.use(cors())
app.use(bodyParser.json())
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
//COUNTING THE DATA FOR STATS
app.get('/projects/count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM projects'
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching projects count:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    res.json(results[0])
  })
})

app.get('/clients/count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM clients'
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching clients count:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    res.json(results[0])
  })
})

app.get('/teams/count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM marabesteam'
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching teams count:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    res.json(results[0])
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
// Handle GET request to fetch project details
app.get('/api/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId
  const sql = 'SELECT * FROM projects WHERE ID = ?'
  pool.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching project:', err)
      return res.status(500).json({ error: 'Failed to fetch project' })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(results[0])
  })
})

// Handle GET request to fetch client details
app.get('/api/projects/:projectId/clients', (req, res) => {
  const projectId = req.params.projectId
  const sql = 'SELECT ID, Name, Contact, Category FROM clients WHERE ProjectID = ?'
  pool.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching clients:', err)
      return res.status(500).json({ error: 'Failed to fetch clients' })
    }
    res.json(results)
  })
})
{
  /* to be revised and fixed later*/
}
app.get('/api/projects/:projectId/team', (req, res) => {
  const projectId = req.params.projectId

  // Log the incoming projectId to verify the request
  console.log('Fetching team for project ID:', projectId)

  const sql = `
  SELECT mu.ID, mu.Name, mu.Picture, mu.Position
  FROM marabesuser mu
  JOIN marabesuser_teams mut ON mu.ID = mut.userId
  JOIN marabesteam mt ON mut.teamId = mt.ID
  JOIN clientteam ct ON mt.ID = ct.TeamID
  JOIN clients c ON ct.ClientID = c.ID
  WHERE c.ID = ?
  `

  pool.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching team:', err)
      return res.status(500).json({ error: 'Failed to fetch team' })
    }

    // Log the results from the query
    console.log('Team results:', results)

    res.json(results)
  })
})
// Handle GET request to fetch hours details
/*app.get('/api/projects/:projectId/hours', (req, res) => {
  const projectId = req.params.projectId
  const sql = 'SELECT hoursSigned, fulfilledHours FROM project_hours WHERE ProjectID = ?'
  pool.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching hours details:', err)
      return res.status(500).json({ error: 'Failed to fetch hours details' })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Hours details not found' })
    }
    res.json(results[0])
  })
})*/
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
      Position
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
          'INSERT INTO marabesuser (email, password, Name, Role, Position, Picture) VALUES (?, ?, ?, ?, ?, ?, ?)'
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
app.post('/api/users', async (req, res) => {
  const { name, picture, position } = req.body

  try {
    const connection = await pool.getConnection()
    const sql = 'INSERT INTO marabesuser (Name, Picture, Position) VALUES (?, ?, ?)'
    await connection.query(sql, [name, picture, position])

    connection.release()
    res.status(201).json({ message: 'User added successfully' })
  } catch (err) {
    console.error('Error adding user:', err)
    res.status(500).json({ error: 'Failed to add user' })
  }
})

app.get('/api/user/:id', (req, res) => {
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
app.put('/api/user/:ID', upload.single('picture'), (req, res) => {
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
// Route for registering a new user
app.post('/api/add/user', upload.single('picture'), (req, res) => {
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
          'INSERT INTO marabesuser (email, password, Name, Role, Position, Picture) VALUES (?, ?, ?, ?, ?, ?, ?)'
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
// Route for authenticating a user
app.post('/user/authenticate', (req, res) => {
  const { email, Password } = req.body

  // Your authentication logic (e.g., check database)
  const sql = `
    SELECT 
      ID, Name, Role
    FROM 
      marabesuser
    WHERE 
      email = ? AND Password = ? 
  `
  pool.query(sql, [email, Password], (err, results) => {
    if (err) {
      console.error('Error during authentication:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    if (results.length > 0) {
      const user = results[0]
      const token = jwt.sign({ id: user.ID, role: user.Role }, JWT_SECRET, { expiresIn: '30m' })
      res.json({ ...user, token }) // Return user details and token if authenticated
    } else {
      res.status(401).json({ error: 'Invalid email or password' })
    }
  })
})
app.post('/user/verifyToken', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    res.json({ id: decoded.id, role: decoded.role })
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

// Fetch details of a specific team by ID
app.get('/api/teams/:ID', (req, res) => {
  const teamId = req.params.ID
  const sql = 'SELECT * FROM marabesteam WHERE ID = ?'
  pool.query(sql, [teamId], (err, result) => {
    if (err) {
      console.error('Error fetching team:', err)
      res.status(500).json({ error: 'Server error' })
    } else if (result.length === 0) {
      res.status(404).json({ error: 'Team not found' })
    } else {
      res.json(result[0])
    }
  })
})

app.put('/api/teams/:ID', (req, res) => {
  const teamId = req.params.ID
  const { name, members } = req.body

  // Ensure members is an array of IDs
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'number')) {
    return res.status(400).json({ error: 'Invalid members format' })
  }

  // Update team name
  const updateTeamQuery = 'UPDATE marabesteam SET Name = ? WHERE ID = ?'
  pool.query(updateTeamQuery, [name, teamId], (err, result) => {
    if (err) {
      console.error('Error updating team:', err)
      return res.status(500).json({ error: 'Failed to update team name' })
    }

    // Delete old team members
    const deleteMembersQuery = 'DELETE FROM marabesuser_teams WHERE TeamID = ?'
    pool.query(deleteMembersQuery, [teamId], (err, result) => {
      if (err) {
        console.error('Error deleting old team members:', err)
        return res.status(500).json({ error: 'Failed to update team members' })
      }

      // Insert new team members
      const insertMembersQuery = 'INSERT INTO marabesuser_teams (TeamID, UserID) VALUES ?'
      const values = members.map((userID) => [teamId, userID])
      pool.query(insertMembersQuery, [values], (err, result) => {
        if (err) {
          console.error('Error inserting new team members:', err)
          return res.status(500).json({ error: 'Failed to update team members' })
        }

        res.status(200).json({ message: 'Team updated successfully' })
      })
    })
  })
})
// Fetch team members based on team ID
app.get('/api/teams/:ID/members', (req, res) => {
  const teamId = req.params.ID
  const sql = `
    SELECT marabesuser.ID, marabesuser.Name, marabesuser.Picture, marabesuser.Position 
    FROM marabesuser_teams 
    JOIN marabesuser ON marabesuser_teams.userId = marabesuser.ID 
    WHERE marabesuser_teams.teamId = ?
  `
  pool.query(sql, [teamId], (err, results) => {
    if (err) {
      console.error('Error fetching team members:', err)
      return res.status(500).json({ error: 'Failed to fetch team members' })
    }
    res.json(results)
  })
})

// Fetch team along with project details associated with the client if exists
app.get('/clientteam/:clientId', (req, res) => {
  const clientId = req.params.clientId
  // SQL query to select team details along with the project associated with the client
  const sql = `
    SELECT mt.ID AS TeamID, mt.Name AS TeamName,
           pr.ID AS ProjectID, pr.Name AS ProjectName, pr.Logo AS ProjectLogo
    FROM clientteam AS ct
    JOIN marabesteam AS mt ON ct.TeamID = mt.ID
    LEFT JOIN clients AS cl ON ct.ClientID = cl.ID
    LEFT JOIN projects AS pr ON cl.ProjectID = pr.ID
    WHERE cl.ID = ?;
  `

  pool.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error('Error fetching client team:', err)
      return res.status(500).json({ error: 'Failed to fetch client team' })
    } else {
      if (results.length > 0) {
        // Return the complete details of team and associated project
        res.json(results[0])
      } else {
        // No team associated with the client
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
app.post('/marabesteam', (req, res) => {
  const { teamName } = req.body

  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' })
  }

  const sql = 'INSERT INTO marabesteam (Name) VALUES (?)'
  pool.query(sql, [teamName], (err, result) => {
    if (err) {
      console.error('Error adding team:', err)
      res.status(500).json({ error: 'Server error', details: err.message })
    } else {
      res.status(201).json({ id: result.insertId, message: 'Team added successfully' })
    }
  })
})
app.post('/marabesteam/:id/members', (req, res) => {
  const teamId = req.params.id
  const { memberIds } = req.body

  if (!Array.isArray(memberIds)) {
    return res.status(400).json({ error: 'memberIds must be an array' })
  }

  // Create an array of arrays, where each sub-array is a pair of teamId and memberId
  const values = memberIds.map((memberId) => [teamId, memberId])

  const sql = 'INSERT INTO marabesuser_teams (teamId, userId) VALUES ?'
  pool.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error adding members to team:', err)
      res.status(500).json({ error: 'Server error', details: err.message })
    } else {
      res.json({ message: 'Members added to team successfully' })
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

// Route for fetching all tasks
app.get('/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks'
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching tasks:', err)
      res.status(500).send('Internal Server Error')
    } else {
      res.json(result)
    }
  })
})

// Route for adding a new task
app.post('/tasks', (req, res) => {
  const { title, description, status, assignedTo, projectId } = req.body
  const sql =
    'INSERT INTO tasks (Title, Description, Status, AssignedTo, ProjectID) VALUES (?, ?, ?, ?, ?)'
  pool.query(sql, [title, description, status, assignedTo, projectId], (err, result) => {
    if (err) {
      console.error('Error adding task:', err)
      return res.status(500).json({ error: 'Failed to add task' })
    }
    res.status(201).json({ message: 'Task added successfully', taskId: result.insertId })
  })
})

// Route for updating a task by ID
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params
  const { title, description, status, assignedTo, projectId } = req.body
  const sql =
    'UPDATE tasks SET Title = ?, Description = ?, Status = ?, AssignedTo = ?, ProjectID = ? WHERE ID = ?'
  pool.query(sql, [title, description, status, assignedTo, projectId, id], (err, result) => {
    if (err) {
      console.error('Error updating task:', err)
      return res.status(500).json({ error: 'Failed to update task' })
    }
    if (result.affectedRows > 0) {
      res.json({ message: 'Task updated successfully' })
    } else {
      res.status(404).json({ error: 'Task not found' })
    }
  })
})

// Route for deleting a task by ID
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM tasks WHERE ID = ?'
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err)
      return res.status(500).json({ error: 'Failed to delete task' })
    }
    if (result.affectedRows > 0) {
      res.json({ message: 'Task deleted successfully' })
    } else {
      res.status(404).json({ error: 'Task not found' })
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
const fetchPeriods = async (clientId) => {
  try {
    const query = `
      SELECT 
        (SELECT Period FROM administration WHERE ClientID = ? AND VAT IS NOT NULL LIMIT 1) AS VATPeriod,
        (SELECT Period FROM administration WHERE ClientID = ? AND ICP IS NOT NULL LIMIT 1) AS ICPPeriod
    `
    const [results] = await pool.query(query, [clientId, clientId])

    if (!results.length) {
      throw new Error('Periods not found')
    }

    const { VATPeriod, ICPPeriod } = results[0]

    return { VATPeriod, ICPPeriod }
  } catch (error) {
    console.error('Error fetching periods:', error)
    throw error // Re-throw the error to handle it in the caller function
  }
}

module.exports = { fetchPeriods }
//===========================CLeint Details DATA===================================//
app.get('/api/teams/:teamId', (req, res) => {
  const teamId = req.params.teamId
  pool.query('SELECT Name FROM marabesteam WHERE ID = ?', [teamId], (error, teamResults) => {
    if (error) {
      console.error('Error fetching team details:', error)
      return res.status(500).json({ error: 'Failed to fetch team details' })
    }
    // Fetching team members
    pool.query(
      'SELECT mu.ID, mu.Name, mu.email, mu.Picture, mu.Role, mu.Position FROM marabesuser mu INNER JOIN marabesuser_teams mut ON mu.ID = mut.userId WHERE mut.teamId = ?',
      [teamId],
      (memberError, memberResults) => {
        if (memberError) {
          console.error('Error fetching team members:', memberError)
          return res.status(500).json({ error: 'Failed to fetch team members' })
        }
        res.json({ name: teamResults[0].Name, members: memberResults })
      },
    )
  })
})

/*const fetchTabData = (tableName) => (req, res) => {
  const clientId = req.params.clientId
  pool.query(`SELECT * FROM ${tableName} WHERE ClientID = ?`, [clientId], (error, results) => {
    if (error) {
      console.error(`Error fetching data for ${tableName}:`, error)
      return res.status(500).json({ error: `Failed to fetch data for ${tableName}` })
    }
    res.json(results[0] || {})
  })
}*/
//=====================Date FILTER===========================//
const fetchTabData = (tableName) => (req, res) => {
  const { clientId } = req.params
  const { year, month } = req.query

  // Assuming you have a database connection pool named 'pool'
  pool.query(
    `SELECT * FROM ${tableName} WHERE ClientID = ? AND Year = ? AND Month = ?`,
    [clientId, year, month],
    (error, results) => {
      if (error) {
        console.error(`Error fetching data for ${tableName}:`, error)
        return res.status(500).json({ error: `Failed to fetch data for ${tableName}` })
      }
      res.json(results[0] || {})
    },
  )
}
const fetchPieChartData = (tableName) => (req, res) => {
  const { clientId } = req.params
  const { startYear, startMonth, endYear, endMonth, column } = req.query

  // Define the enum columns for each table
  const tableEnumColumns = {
    administration: [
      'Cash',
      'Bank',
      'Invoice',
      'LIP',
      'TB',
      'VAT',
      'ICP',
      'Salary',
      'PAWW',
      'Pension',
      'TKH',
      'CBS',
      'CBAM',
      'OSS',
    ],
    backoffice: ['Pay', 'Billing', 'Report', 'Mail'],
    audit: ['FS', 'Hours'],
    advisory: ['Project', 'Hours'],
    yearwork: ['IB', 'FS', 'VPB', 'SUP', 'KVK', 'YW'],
  }

  const enumColumns = tableEnumColumns[tableName]
  if (!enumColumns) {
    console.error(`Enum columns not defined for table: ${tableName}`)
    return res.status(500).json({ error: `Enum columns not defined for table: ${tableName}` })
  }

  // If column filter is provided, use only that column; otherwise, use all columns
  const columnsToUse = column ? [column] : enumColumns

  // Generate the CASE statements for each enum column
  const caseStatements = columnsToUse
    .map(
      (col) => `
      SUM(CASE WHEN ${col} = 'O' THEN 1 ELSE 0 END) AS ${col}_O,
      SUM(CASE WHEN ${col} = 'W' THEN 1 ELSE 0 END) AS ${col}_W,
      SUM(CASE WHEN ${col} = 'NA' THEN 1 ELSE 0 END) AS ${col}_NA,
      SUM(CASE WHEN ${col} = 'DN' THEN 1 ELSE 0 END) AS ${col}_DN,
      SUM(CASE WHEN ${col} = 'P' THEN 1 ELSE 0 END) AS ${col}_P,
      SUM(CASE WHEN ${col} = 'R' THEN 1 ELSE 0 END) AS ${col}_R,
      SUM(CASE WHEN ${col} = 'D' THEN 1 ELSE 0 END) AS ${col}_D,
      SUM(CASE WHEN ${col} = 'A' THEN 1 ELSE 0 END) AS ${col}_A,
      SUM(CASE WHEN ${col} = 'C' THEN 1 ELSE 0 END) AS ${col}_C
    `,
    )
    .join(',')

  // Construct the query with the generated CASE statements
  const query = `
    SELECT ${caseStatements}
  FROM ${tableName}
  WHERE ClientID = ? AND 
  ((Year > ? OR (Year = ? AND Month >= ?)) AND 
  (Year < ? OR (Year = ? AND Month <= ?))) ${column ? `AND ${column} IS NOT NULL` : ''}
`

  // Query parameters to be used in the query
  const queryParams = [clientId, startYear, startYear, startMonth, endYear, endYear, endMonth]

  // Execute the query
  pool.query(query, queryParams, (error, results) => {
    if (error) {
      console.error(`Error fetching data for ${tableName}:`, error)
      return res.status(500).json({ error: `Failed to fetch data for ${tableName}` })
    }

    // Accumulate counts for each enum option
    const counts = results.reduce((acc, row) => {
      columnsToUse.forEach((col) => {
        ;['O', 'W', 'NA', 'DN', 'P', 'R', 'D', 'A', 'C'].forEach((option) => {
          const key = `${col}_${option}`
          acc[option] = (acc[option] || 0) + (row[key] || 0)
        })
      })
      return acc
    }, {})

    // Send the response with the accumulated counts
    res.json(counts)
  })
}

//Project overview
const tableEnumColumns = {
  administration: [
    'Cash',
    'Bank',
    'Invoice',
    'LIP',
    'TB',
    'VAT',
    'ICP',
    'Salary',
    'PAWW',
    'Pension',
    'TKH',
    'CBS',
    'CBAM',
    'OSS',
  ],
  backoffice: ['Pay', 'Billing', 'Report', 'Mail'],
  audit: ['FS', 'Hours'],
  advisory: ['Project', 'Hours'],
  yearwork: ['IB', 'FS', 'VPB', 'SUP', 'KVK', 'YW'],
}

// Endpoint to calculate and fetch option counts
app.get('/api/projects/:projectId/stats', (req, res) => {
  const { projectId } = req.params
  const { table, column } = req.query
  const counts = {}

  // Function to process query results
  const processResults = (results, column) => {
    results.forEach((row) => {
      const value = row[column]
      if (value) {
        if (!counts[value]) {
          counts[value] = 0
        }
        counts[value]++
      }
    })
  }

  // Check if table and column are specified
  if (table && column) {
    if (!tableEnumColumns[table] || !tableEnumColumns[table].includes(column)) {
      return res.status(400).json({ error: 'Invalid table or column' })
    }

    pool.query(
      `SELECT ${column} FROM ${table} WHERE ClientID IN (SELECT ID FROM clients WHERE ProjectID = ?)`,
      [projectId],
      (err, results) => {
        if (err) {
          console.error('Error executing query:', err)
          return res.status(500).json({ error: 'Internal server error' })
        }
        processResults(results, column)
        res.json(counts)
      },
    )
  } else {
    // Fetch counts for all tables and columns if no specific filter is applied
    const queries = []

    Object.keys(tableEnumColumns).forEach((table) => {
      tableEnumColumns[table].forEach((column) => {
        queries.push(
          new Promise((resolve, reject) => {
            pool.query(
              `SELECT ${column} FROM ${table} WHERE ClientID IN (SELECT ID FROM clients WHERE ProjectID = ?)`,
              [projectId],
              (err, results) => {
                if (err) {
                  return reject(err)
                }
                processResults(results, column)
                resolve()
              },
            )
          }),
        )
      })
    })

    Promise.all(queries)
      .then(() => res.json(counts))
      .catch((err) => {
        console.error('Error executing queries:', err)
        res.status(500).json({ error: 'Internal server error' })
      })
  }
})
//=====================Date FILTER===========================//
const saveTabData = (tableName) => (req, res) => {
  const clientId = req.params.clientId
  const data = req.body
  data.ClientID = clientId

  // Extracting Year and Month from the request body
  const { Year, Month } = data

  pool.query(
    `SELECT * FROM ${tableName} WHERE ClientID = ? AND Year = ? AND Month = ?`,
    [clientId, Year, Month],
    (error, results) => {
      if (error) {
        console.error(`Error fetching data for ${tableName}:`, error)
        return res.status(500).json({ error: `Failed to fetch data for ${tableName}` })
      }

      if (results.length > 0) {
        pool.query(
          `UPDATE ${tableName} SET ? WHERE ClientID = ? AND Year = ? AND Month = ?`,
          [data, clientId, Year, Month],
          (updateError) => {
            if (updateError) {
              console.error(`Error updating data for ${tableName}:`, updateError)
              return res.status(500).json({ error: `Failed to update data for ${tableName}` })
            }
            res.json({ success: true, data })
          },
        )
      } else {
        pool.query(`INSERT INTO ${tableName} SET ?`, data, (insertError) => {
          if (insertError) {
            console.error(`Error inserting data into ${tableName}:`, insertError)
            return res.status(500).json({ error: `Failed to insert data into ${tableName}` })
          }
          res.json({ success: true, data })
        })
      }
    },
  )
}

app.get('/api/administration/:clientId', fetchTabData('administration'))
app.get('/api/pie/administration/:clientId', fetchPieChartData('administration'))
app.post('/api/administration/:clientId', saveTabData('administration'))

app.get('/api/backoffice/:clientId', fetchTabData('backoffice'))
app.get('/api/pie/backoffice/:clientId', fetchPieChartData('backoffice'))
app.post('/api/backoffice/:clientId', saveTabData('backoffice'))

app.get('/api/audit/:clientId', fetchTabData('audit'))
app.get('/api/pie/audit/:clientId', fetchPieChartData('audit'))
app.post('/api/audit/:clientId', saveTabData('audit'))

app.get('/api/advisory/:clientId', fetchTabData('advisory'))
app.get('/api/pie/advisory/:clientId', fetchPieChartData('advisory'))
app.post('/api/advisory/:clientId', saveTabData('advisory'))

app.get('/api/yearwork/:clientId', fetchTabData('yearwork'))
app.get('/api/pie/yearwork/:clientId', fetchPieChartData('yearwork'))
app.post('/api/yearwork/:clientId', saveTabData('yearwork'))

//display stats of operations for the project overview
app.get('/api/projects/:projectId/clients/tab-options/:tabName', async (req, res) => {
  const { projectId, tabName } = req.params

  try {
    pool.getConnection((err, connection) => {
      if (err) throw err

      const tableName = tabName.toLowerCase() // Convert tab name to lowercase for table name

      const query = `
        SELECT *
        FROM ${tableName}
        WHERE ClientID IN (
          SELECT ID
          FROM clients
          WHERE ProjectID = ?
        )
      `

      connection.query(query, [projectId], (error, results) => {
        connection.release() // Release the connection after query execution

        if (error) {
          console.error(`Error fetching data for ${tabName}:`, error)
          return res.status(500).json({ error: `Failed to fetch data for ${tabName}` })
        }

        res.json(results) // Send fetched data as JSON response
      })
    })
  } catch (error) {
    console.error('Error in tab options endpoint:', error)
    res.status(500).json({ error: 'Failed to fetch tab options data' })
  }
})

//=====================Date FILTER===========================//
// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
