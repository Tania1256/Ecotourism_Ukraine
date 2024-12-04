const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path'); 

const app = express();
const port = 3000;

// Підключення до бази даних MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'root', 
  database: 'ecotourism' 
});

// Перевірка підключення до бази даних
db.connect((err) => {
  if (err) throw err;
  console.log('Підключено до бази даних!');
});

// Налаштування для обробки форм
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Статичні файли (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'))); 

app.use('/photos', express.static('public/photos'));

// Головний маршрут для домашньої сторінки
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views')); 

app.get('/search', (req, res) => {
  const query = req.query.query;

  if (!query) {
      return res.status(400).json({ message: "Query parameter is missing" });
  }

  const searchQuery = `
      SELECT 'camping' AS type, name, description, image_url
      FROM Campings
      WHERE name LIKE ? OR description LIKE ?
      UNION ALL
      SELECT 'route' AS type, name, description, image_url
      FROM Routes
      WHERE name LIKE ? OR description LIKE ?
      UNION ALL
      SELECT 'waterfall' AS type, name, description, image_url
      FROM Waterfalls
      WHERE name LIKE ? OR description LIKE ?
  `;

  db.query(searchQuery, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`], (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Database query failed' });
      }

      res.json(results);
  });
});

// Маршрути для інших сторінок
// Сторінка для кемпінгів
app.get('/camping', (req, res) => {
  db.query('SELECT * FROM Campings', (err, results) => {
    if (err) throw err;
    res.render('camping', { campings: results }); 
  });
});

app.get('/routes', (req, res) => {
  const { distance } = req.query;

  let query = 'SELECT * FROM Routes';
  const params = [];

  // Фільтрація за довжиною маршруту
  if (distance === 'short') {
    query += ' WHERE distance_km < ?';
    params.push(10);
  } else if (distance === 'medium') {
    query += ' WHERE distance_km BETWEEN ? AND ?';
    params.push(10, 20);
  } else if (distance === 'long') {
    query += ' WHERE distance_km > ?';
    params.push(20);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Помилка отримання даних:', err);
      res.status(500).send('Помилка сервера');
    } else {
      res.render('routes', { 
        routes: results, 
        distance: distance || "" 
      });
    }
  });
});

// Сторінка для водоспадів
app.get('/waterfalls', (req, res) => {
  db.query('SELECT * FROM Waterfalls', (err, results) => {
    if (err) throw err;
    res.render('waterfalls', { waterfalls: results }); 
  });
});

// Сторінка реєстрації
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html')); 
});

// Сторінка входу
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html')); 
});

// Обробка реєстрації користувача
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  db.query('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
    if (err) throw err;
    res.send('Реєстрація успішна! <a href="/login">Увійти</a>');
  });
});

// Обробка входу користувача
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send('Вхід успішний! <a href="/">На головну</a>');
    } else {
      res.send('Невірний логін або пароль');
    }
  });
});

// Додавання локації до улюблених
app.post('/save-favorites', (req, res) => {
  const { userId, campingId, routeId, waterfallId } = req.body;

  // Перевірка, який тип локації додавати
  let query = 'INSERT INTO Favorites (user_id, camping_id, route_id, waterfall_id) VALUES (?, ?, ?, ?)';
  let values = [userId, campingId || null, routeId || null, waterfallId || null];

  db.query(query, values, (err, result) => {
    if (err) throw err;
    res.send('Локація успішно додана до улюблених!');
  });
});

// Маршрут для перегляду вподобаних локацій
app.get('/favorites', (req, res) => {
  const userId = 1; 

  const query = `
    SELECT 'camping' AS type, Campings.name AS name, Campings.description, Campings.image_url
    FROM Favorites
    JOIN Campings ON Favorites.camping_id = Campings.id
    WHERE Favorites.user_id = ?

    UNION ALL

    SELECT 'route' AS type, Routes.name AS name, Routes.description, Routes.image_url
    FROM Favorites
    JOIN Routes ON Favorites.route_id = Routes.id
    WHERE Favorites.user_id = ?

    UNION ALL

    SELECT 'waterfall' AS type, Waterfalls.name AS name, Waterfalls.description, Waterfalls.image_url
    FROM Favorites
    JOIN Waterfalls ON Favorites.waterfall_id = Waterfalls.id
    WHERE Favorites.user_id = ?
  `;
  
  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) throw err;
    res.render('favorites', { favorites: results }); 
  });
});

// Маршрут для видалення локації з уподобаних
app.delete('/remove-favorite/:campingId', (req, res) => {
  const userId = 1; 
  const campingId = req.params.campingId; 

  const query = `DELETE FROM Favorites WHERE user_id = ? AND camping_id = ?`;
  db.query(query, [userId, campingId], (err, result) => {
      if (err) {
          console.error('Помилка при видаленні:', err);
          return res.status(500).send('Сталася помилка на сервері');
      }

      if (result.affectedRows === 0) {
          return res.status(404).send('Локація не знайдена у вподобаних');
      }

      res.sendStatus(200); 
  });
});

app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/views/404.html');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер працює на порту ${port}`);
});