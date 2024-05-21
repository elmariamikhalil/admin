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

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads')) // Specify the public directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Use the original filename for the uploaded file
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
app.post('/client', upload.single('logo'), (req, res) => {
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
/*
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
*/
// Define a route to update a company
app.put('/client/:id', upload.single('Picture'), (req, res) => {
  const clientId = req.params.id
  const { Name, Owner, Email, Category } = req.body
  let pictureBase64 = null

  if (req.file) {
    const picturePath = req.file.path
    try {
      const pictureBuffer = fs.readFileSync(picturePath)
      pictureBase64 = pictureBuffer.toString('base64')
    } catch (error) {
      console.error('Error reading picture file:', error)
      return res.status(500).json({ error: 'Failed to read picture file' })
    }
  }

  const query = pictureBase64
    ? 'UPDATE client SET Name = ?, Owner = ?, Email = ?, Category = ?, Picture = ? WHERE Id = ?'
    : 'UPDATE client SET Name = ?, Owner = ?, Email = ?, Category = ? WHERE Id = ?'

  const values = pictureBase64
    ? [Name, Owner, Email, Category, pictureBase64, clientId]
    : [Name, Owner, Email, Category, clientId]

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating client:', err)
      return res.status(500).json({ error: 'Failed to update client' })
    }

    res.json({ message: 'Client updated successfully' })
  })
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
      const payload = {
        id: results[0].Id,
        email: results[0].email,
        name: results[0].Name,
        role: results[0].Role, // Assuming Role is a column in your user table
      }
      const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })

      // Return the authentication token and role as a JSON response
      res.json({ token: authToken, role: payload.role })
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
