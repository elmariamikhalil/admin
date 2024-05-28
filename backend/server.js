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
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'marabes',
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

// Route for uploading logo
app.post('/maincompany', upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.')
  }
  const logoUrl = `/uploads/${req.file.filename}`
  // Save logoUrl to database or return it to the frontend
  const sql = 'UPDATE maincompany SET Logo = ? WHERE Id = 1' // Adjust the WHERE clause based on your requirement
  pool.query(sql, [logoUrl], (err, result) => {
    if (err) {
      console.error('Error updating maincompany logo:', err)
      res.status(500).send('Internal server error')
    } else {
      res.send(logoUrl)
    }
  })
})

// Route for uploading logo and adding a new company
app.put('/addclient/:id', upload.single('logo'), (req, res) => {
  // Extract data from the request body
  const { Name, Owner, Email, Category } = req.body
  const logoUrl = `/uploads/${req.file.filename}`

  // Insert the new company details into the database
  const sql = 'INSERT INTO client (Name, Owner, Email, Category, Logo) VALUES (?, ?, ?, ?, ?)'
  pool.query(sql, [Name, Owner, Email, Category, req.file.filename], (err, result) => {
    if (err) {
      console.error('Error adding company:', err)
      return res.status(500).json({ error: 'Failed to add company' })
    }
    res.status(201).json({ message: 'Company added successfully' })
  })
})

app.get('/client', (req, res) => {
  const sql = 'SELECT * FROM client' // Adjust SQL query based on your schema
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching companies:', err)
      res.status(500).send('Internal Server Error')
    } else {
      res.json(result) // Send list of companies as JSON response
    }
  })
})

app.get('/client/:Id', (req, res) => {
  const clientId = req.params.Id
  const sql = 'SELECT * FROM client WHERE Id = ?' // Adjust SQL query based on your schema
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
  // Extract user details from the request body
  const { email, password, name } = req.body

  // Check if the email already exists in the database
  const sql = 'SELECT * FROM user WHERE email = ?'
  pool.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err)
        return res.status(500).json({ error: 'Failed to register user' })
      }

      // Insert the new user into the database
      const sql = 'INSERT INTO user (email, password, name) VALUES (?, ?, ?)'
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

// Define a route to update a company
const updateClientDetails = (clientId, details, res) => {
  const { Name, Owner, Email, Category, Logo } = details

  let query = ''
  let values = []

  if (Logo) {
    query = 'UPDATE client SET Name = ?, Owner = ?, Email = ?, Category = ?, Logo = ? WHERE Id = ?'
    values = [Name, Owner, Email, Category, Logo, clientId]
  } else {
    query = 'UPDATE client SET Name = ?, Owner = ?, Email = ?, Category = ? WHERE Id = ?'
    values = [Name, Owner, Email, Category, clientId]
  }

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating client:', err)
      return res.status(500).json({ error: 'Failed to update client' })
    }
    console.log('Client updated successfully')
    res.json({ message: 'Client updated successfully' })
  })
}

// Endpoint to update client details
app.put('/editclient/:id', upload.single('Picture'), (req, res) => {
  const clientId = req.params.id
  const { Name, Owner, Email, Category } = req.body
  let logoFilename = null

  if (req.file) {
    const picturePath = req.file.path
    fs.readFile(picturePath, (error, pictureBuffer) => {
      if (error) {
        console.error('Error reading picture file:', error)
        return res.status(500).json({ error: 'Failed to read picture file' })
      }
      // Convert the picture buffer to base64 string
      const base64Image = pictureBuffer.toString('base64')
      // Determine the file extension
      const ext = path.extname(req.file.originalname).toLowerCase()
      // Generate a unique filename with extension
      logoFilename = `logo_${Date.now()}${ext}`
      // Example of saving the file to a specific directory
      const uploadPath = path.join(__dirname, '../public/uploads', logoFilename)
      console.log(uploadPath)
      // Write the base64 image data to the file
      fs.writeFile(uploadPath, base64Image, 'base64', (err) => {
        if (err) {
          console.error('Error saving picture file:', err)
          return res.status(500).json({ error: 'Failed to save picture file' })
        }
        // Once the file is saved, proceed to update client details in the database
        updateClientDetails(clientId, { Name, Owner, Email, Category, Logo: logoFilename }, res)
      })
    })
  } else {
    // If no file is uploaded, proceed to update client details without logoFilename
    updateClientDetails(clientId, { Name, Owner, Email, Category }, res)
  }
})
app.get('/user', (req, res) => {
  const sql = 'SELECT * FROM user'
  pool.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

// Route for getting maincompany data by ID
app.get('/maincompany', (req, res) => {
  const sql = 'SELECT * FROM maincompany WHERE Id = 1'
  pool.query(sql, (err, result) => {
    if (err) throw err
    if (result.length === 0) {
      res.status(404).send('Company not found')
    } else {
      res.send(result[0])
    }
  })
})

// Route for authenticating a user
app.post('/user/authenticate', (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body

  // Retrieve the user from the database based on the provided email
  const sql = 'SELECT * FROM user WHERE email = ?'
  pool.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }

    // Check if a user with the given email exists
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare the password hash with the provided password
    bcrypt.compare(password, results[0].password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }

      // Generate a JWT token with a payload containing user information
      const token = jwt.sign({ id: results[0].id, email: results[0].email }, JWT_SECRET, {
        expiresIn: '1h', // Token expiration time (adjust as needed)
      })

      // Send the token as a response
      res.json({ token })
    })
  })
})

// TEAM DETAILS

// Fetch all teams
app.get('/api/teams', async (req, res) => {
  try {
    const sql = `
      SELECT 
        team.id AS team_id, 
        team.name AS team_name, 
        GROUP_CONCAT(
          CONCAT(
            '{"email":"', user.email, '",',
            '"Name":"', user.name, '",',
            '"Picture":"', user.picture, '",',
            '"Position":"', user.position, '",',
            '"Role":"', user.role, '"}'
          )
        ) AS members
      FROM team
      LEFT JOIN team_members ON team.id = team_members.team_id
      LEFT JOIN user ON team_members.user_id = user.Id
      GROUP BY team.id, team.name
    `
    pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching teams:', err)
        res.status(500).send('Server error')
      } else {
        // Parse the concatenated JSON strings
        const teams = results.map((row) => ({
          team_id: row.team_id,
          team_name: row.team_name,
          members: row.members ? JSON.parse(`[${row.members}]`) : [],
        }))
        res.json(teams)
      }
    })
  } catch (error) {
    console.error('Error fetching teams:', error)
    res.status(500).send('Server error')
  }
})

app.get('/api/teams/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT 
        team.id AS team_id, 
        team.name AS team_name, 
        GROUP_CONCAT(
          CONCAT(
            '{"email":"', user.email, '",',
            '"Name":"', user.name, '",',
            '"Picture":"', user.picture, '",',
            '"Position":"', user.position, '",',
            '"Role":"', user.role, '"}'
          )
        ) AS members
      FROM team
      LEFT JOIN team_members ON team.id = team_members.team_id
      LEFT JOIN user ON team_members.user_id = user.Id
      WHERE team.id = ?
      GROUP BY team.id, team.name
    `
    pool.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Error fetching team:', err)
        res.status(500).send('Server error')
      } else if (results.length === 0) {
        res.status(404).send('Team not found')
      } else {
        const team = {
          team_id: results[0].team_id,
          team_name: results[0].team_name,
          members: results[0].members ? JSON.parse(`[${results[0].members}]`) : [],
        }
        res.json(team)
      }
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    res.status(500).send('Server error')
  }
})

// Update team details
app.put('/api/teams/:id', (req, res) => {
  const { id } = req.params
  const { name, members } = req.body

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err)
      return res.status(500).send('Server error')
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err)
        connection.release()
        return res.status(500).send('Server error')
      }

      // Update team name
      const updateTeamQuery = 'UPDATE team SET name = ? WHERE id = ?'
      connection.query(updateTeamQuery, [name, id], (err, results) => {
        if (err) {
          console.error('Error updating team:', err)
          return connection.rollback(() => {
            connection.release()
            res.status(500).send('Server error')
          })
        }

        // Delete existing team members
        const deleteMembersQuery = 'DELETE FROM team_members WHERE team_id = ?'
        connection.query(deleteMembersQuery, [id], (err, results) => {
          if (err) {
            console.error('Error deleting team members:', err)
            return connection.rollback(() => {
              connection.release()
              res.status(500).send('Server error')
            })
          }

          // Insert new team members
          const insertMemberQuery = 'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)'
          const memberPromises = members.map((member) => {
            return new Promise((resolve, reject) => {
              const userQuery = 'SELECT Id FROM user WHERE email = ?'
              connection.query(userQuery, [member.email], (err, results) => {
                if (err) {
                  return reject(err)
                }
                const userId = results[0].id
                connection.query(insertMemberQuery, [id, userId], (err, results) => {
                  if (err) {
                    return reject(err)
                  }
                  resolve()
                })
              })
            })
          })

          Promise.all(memberPromises)
            .then(() => {
              connection.commit((err) => {
                if (err) {
                  console.error('Error committing transaction:', err)
                  return connection.rollback(() => {
                    connection.release()
                    res.status(500).send('Server error')
                  })
                }
                connection.release()
                res.status(200).send('Team updated successfully')
              })
            })
            .catch((err) => {
              console.error('Error inserting team members:', err)
              connection.rollback(() => {
                connection.release()
                res.status(500).send('Server error')
              })
            })
        })
      })
    })
  })
})
// Fetch details of a specific user by ID
app.get('/user/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM user WHERE Id = ?', [id])
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result[0])
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user details
app.put('/user/:id', async (req, res) => {
  const { id } = req.params
  const { email, name, picture, position, role } = req.body
  const updateQuery =
    'UPDATE user SET email = ?, name = ?, picture = ?, position = ?, role = ? WHERE Id = ?'
  const updateValues = [email, name, picture, position, role, id]

  try {
    const result = await pool.query(updateQuery, updateValues)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Server error' })
  }
})
//Team and memebers//

// Add Team to Client
const addTeamToClient = (req, res) => {
  const { clientId } = req.params
  const { teamId } = req.body

  if (!clientId || !teamId) {
    return res.status(400).json({ error: 'ClientId and TeamId are required' })
  }

  // Insert record into client_teams table
  const sql = 'INSERT INTO client_teams (client_id, team_id) VALUES (?, ?)'
  pool.query(sql, [clientId, teamId], (err, result) => {
    if (err) {
      console.error('Error adding team to client:', err)
      return res.status(500).json({ error: 'Failed to add team to client' })
    }
    res.status(201).json({ message: 'Team added to client successfully' })
  })
}

// Add Member to Team
const addMemberToTeam = (req, res) => {
  const { teamId } = req.params
  const { memberId } = req.body

  // Insert record into team_members table
  const sql = 'INSERT INTO team_members (team_id, member_id) VALUES (?, ?)'
  pool.query(sql, [teamId, memberId], (err, result) => {
    if (err) {
      console.error('Error adding member to team:', err)
      return res.status(500).json({ error: 'Failed to add member to team' })
    }
    res.status(201).json({ message: 'Member added to team successfully' })
  })
}

app.post('/clients/:clientId/teams', addTeamToClient)

// Ensure specific error messages are sent to the client
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
// Sanitize user input to prevent SQL injection attacks
app.post('/clients/:clientId/teams', (req, res) => {
  const { clientId } = req.params
  const { teamId } = req.body

  if (!clientId || !teamId) {
    return res.status(400).json({ error: 'ClientId and TeamId are required' })
  }

  // Sanitize input
  const clientIdSanitized = pool.escape(clientId)
  const teamIdSanitized = pool.escape(teamId)

  // Insert record into client_teams table
  const sql = 'INSERT INTO client_teams (client_id, team_id) VALUES (?, ?)'
  pool.query(sql, [clientIdSanitized, teamIdSanitized], (err, result) => {
    id
    if (err) {
      console.error('Error adding team to client:', err)
      return res.status(500).json({ error: 'Failed to add team to client' })
    }
    res.status(201).json({ message: 'Team added to client successfully' })
  })
})

app.get('/teams', (req, res) => {
  const sql = 'SELECT * FROM team'
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching teams:', err)
      res.status(500).json({ error: 'Failed to fetch teams' })
      return
    }
    res.status(200).json(results)
  })
})
// Assuming you have an array or a database collection of members
// Fetch members
app.get('/members', (req, res) => {
  const sql = 'SELECT * FROM user' // Adjust this query based on your table structure
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching members:', err)
      res.status(500).json({ error: 'Failed to fetch members' })
      return
    }
    res.status(200).json(results)
  })
})
app.get('/clients/:clientId/teams', (req, res) => {
  const clientId = req.params.clientId
  pool.query('SELECT * FROM client_teams WHERE client_id = ?', [clientId], (error, results) => {
    if (error) {
      console.error('Error fetching teams:', error)
      res.status(500).send('Server error')
    } else {
      res.json(results)
    }
  })
})
app.get('/clients/:clientId/teams', (req, res) => {
  const clientId = req.params.clientId
  const query = `
    SELECT t.id, t.name 
    FROM team_assignments ta
    JOIN team t ON ta.team_id = t.id
    WHERE ta.client_id = ?
  `
  pool.query(query, [clientId], (error, results) => {
    if (error) {
      console.error('Error fetching teams:', error)
      res.status(500).send('Server error')
    } else {
      res.json(results)
    }
  })
})
// Fetch members of a team
app.get('/teams/:teamId/members', (req, res) => {
  const { teamId } = req.params
  const sql = `
    SELECT u.Id, u.name
    FROM team_members tm
    JOIN user u ON tm.user_id = u.Id
    WHERE tm.team_id = ?
  `
  pool.query(sql, [teamId], (err, results) => {
    if (err) {
      console.error('Error fetching team members:', err)
      res.status(500).json({ error: 'Failed to fetch team members' })
      return
    }
    res.status(200).json(results)
  })
})
// Add member to team
app.post('/teams/:teamId/members', (req, res) => {
  const { teamId } = req.params
  const { memberId } = req.body
  const sql = 'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)'
  pool.query(sql, [teamId, memberId], (err, results) => {
    if (err) {
      console.error('Error adding member to team:', err)
      res.status(500).json({ error: 'Failed to add member to team' })
      return
    }
    res.status(200).json({ message: 'Member added to team successfully' })
  })
})

// Remove member from team
app.delete('/teams/:teamId/members/:memberId', (req, res) => {
  const { teamId, memberId } = req.params
  const sql = 'DELETE FROM team_members WHERE team_id = ? AND user_id = ?'
  pool.query(sql, [teamId, memberId], (err, results) => {
    if (err) {
      console.error('Error removing member from team:', err)
      res.status(500).json({ error: 'Failed to remove member from team' })
      return
    }
    res.status(200).json({ message: 'Member removed from team successfully' })
  })
})

// Mock data for tabs
let administrationData = {
  Cash: 'N/A',
  Bank: 'O',
  Invoice: 'DN',
  LIP: 'W',
  TB: 'P',
  VAT: 'R',
  ICP: 'D',
  Salary: 'A',
  CBS: 'C',
}
let backofficeData = {
  Pay: 'N/A',
  Billing: 'O',
  Report: 'DN',
  Mail: 'W',
}
let auditData = {
  FS: 'N/A',
  Hours: 'O',
  Deadlines: 'DN',
}
let advisoryData = {
  ProjectHours: 'N/A',
  Deadlines: 'O',
}
let yearworkData = {
  IB: 'N/A',
  FS: 'O',
  VPB: 'DN',
  SUP: 'W',
  KVK: 'P',
}
//================Operations Section===================//
// Endpoint to fetch client details
app.get('/client/:ClientId', (req, res) => {
  const ClientId = req.params.ClientId
  const query = 'SELECT * FROM client WHERE Id = ?'
  pool.query(query, [ClientId], (err, result) => {
    if (err) {
      console.error('Error fetching client data:', err)
      res.status(500).json({ error: 'Error fetching client data' })
      return
    }
    res.json(result[0])
  })
})

// Endpoint to fetch team members
app.get('/api/teams/:teamId', (req, res) => {
  const teamId = req.params.teamId
  const query = 'SELECT * FROM team WHERE id = ?'
  pool.query(query, [teamId], (err, result) => {
    if (err) {
      console.error('Error fetching team members:', err)
      res.status(500).json({ error: 'Error fetching team members' })
      return
    }
    res.json({ members: result })
  })
})

// Function to fetch tab data
const fetchTabData = (tab, ClientId, res) => {
  const query = `SELECT * FROM ${tab} WHERE ClientId = ?`
  pool.query(query, [ClientId], (err, result) => {
    if (err) {
      console.error(`Error fetching data for ${tab}:`, err)
      res.status(500).json({ error: `Error fetching data for ${tab}` })
      return
    }
    res.json(result[0])
  })
}

// Endpoint to fetch tab data
app.get('/api/:tab/:ClientId', (req, res) => {
  const tab = req.params.tab
  const ClientId = req.params.ClientId
  fetchTabData(tab, ClientId, res)
})

// Endpoint to update tab data
app.post('/api/:tab/:ClientId', (req, res) => {
  const tab = req.params.tab
  const ClientId = req.params.ClientId
  const updatedData = req.body
  console.log(`Updating ${tab} data for ClientId ${ClientId}:`, updatedData) // Debugging log
  const query = `UPDATE ${tab} SET ? WHERE ClientId = ?`
  pool.query(query, [updatedData, ClientId], (err, result) => {
    if (err) {
      console.error(`Error updating data for ${tab}:`, err)
      res.status(500).json({ error: `Error updating data for ${tab}` })
      return
    }
    res.json({ message: 'Data saved successfully' })
  })
})

//==========DOUNUT Data Fetch ==================//
const doughnutData = {
  labels: ['Red', 'Green', 'Yellow'],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    },
  ],
}
app.get('/api/doughnut/:clientId', (req, res) => {
  // Fetch data for the doughnut chart based on clientId (you can replace this with your actual data fetching logic)
  // Example: Fetch data from the database based on clientId
  const clientId = req.params.clientId
  const doughnutData = fetchDataFromDatabase(clientId)

  // Send the doughnut data as response
  res.json(doughnutData)
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
