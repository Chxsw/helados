//Libreria de Express
const express = require('express');
//Libreria Path
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');
const multer = require('multer');
const app = express();
const port = 3000;

const upload = multer({dest: 'imagenes/'});

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '10.0.6.39',
    user: 'estudiante',
    password: 'Info-2023',
    database: 'HeladeriaVA'
});
//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});


//middlwere
app.use(express.urlencoded({extended: true}));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));

//imagenes

// Subir una imagen con nombre y descripción
app.post('/subir_imagenes', upload.single('imagen'), (req,res) => {
    //url datos
    const {nombre, descripcion} = req.body;

    //url imagen
    const imagen = req.file.filename;

    const sql ='insert into imagenes (nombre, descripcion, imagen) values (?, ?, ?)';

    connection.query(sql, [nombre, descripcion, imagen], (err) =>{
        //error
        if(err) throw err;

        res.redirect('zzimag.html');
    })
});

//pedir img

app.get('/imagenes', (req, res) =>{
    const sql = 'select nombre, descripcion, imagen from imagenes';
    connection.query(sql, (err, result) =>{
        if(err){
            console.error('Error al obtener la BD'+ err.stack);
            res.status(500).send('Error');
            return;
        }
        //json
        res.json(result);

    });
});


//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));
//Recibo los valores y los envio a la tabla
app.post('/guardar_helado',(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio], (err, result) => {
        if (err) throw err;
        console.log('Helado insertada correctamente.');
        res.redirect('/listardatos.html');
    });
});
//Ruta para mostrar las películas en el listardatos.html con metodo GET
app.get('/obtener_helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "peliculas"
    connection.query('SELECT * FROM Helado', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});
// Ruta para obtener los datos de una película por su ID
app.get('/helado_especifico/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos del Helado:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('Helado no encontrado');
            return;
        }
     
        res.json(result[0]);
    });
});

//Define una ruta DELETE en la aplicación Express para eliminar un Componente
app.delete('/eliminar_helado/:id', (req, res) => {
  
    const id = req.params.id;
  
    const sql = 'DELETE FROM Helado WHERE id = ?';
   
    connection.query(sql, [id], (err, result) => {
        
        if (err) throw err;
       
        console.log('Helado eliminado correctamente.');
      
        res.sendStatus(200); 
    });
});



app.get('/obtener_helado/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM Helado WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el Helado:', err);
            return res.status(500).json({ error: 'Error al obtener el helado de la base de datos.' });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ error: 'Helado no encontrado.' });
        }
    });
});

app.post('/guardar_usuario', (req, res) => {
    const { nombre, contraseña } = req.body;
    const sql = 'INSERT INTO Usuarios (nombre, contraseña) VALUES (?, ?)';
    connection.query(sql, [nombre, contraseña], (err, result) => {
        if (err) {
            console.error('Error al guardar el usuario:', err);
            return res.status(500).json({ error: 'Error al guardar el usuario en la base de datos.' });
        }
        res.redirect('usuar.html'); 
    });
});

app.get('/obtener_usuarios', (req, res) => {
    const sql = 'SELECT * FROM Usuarios';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener los usuarios de la base de datos.' });
        }
        res.json(result);
    });
});

app.delete('/eliminar_usuario/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Usuarios WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).json({ error: 'Error al eliminar el usuario de la base de datos.' });
        }
        res.json({ success: true });
    });
});

app.post('/modificar_usuario', (req, res) => {
    const { id, Nombre,  Contraseña } = req.body;
    const sql = 'UPDATE Usuarios SET Nombre = ?, Contraseña = ? WHERE id = ?';
    connection.query(sql, [Nombre, Contraseña, id], (err, result) => {
        if (err) {
            console.error('Error al modificar el usuario:', err);
            return res.status(500).json({ error: 'Error al modificar el usuario en la base de datos.' });
        }
        res.redirect('ausuarios.html'); 
    });
});



//Servidor ejecutandose en el puerto 3000
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

