import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { PORT, __dirname, MONGO_DB_NAME, MONGO_URI } from "./utils.js";

import { messageModel } from "./dao/fsManagers/models/messages.model.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/cart.routes.js";
import viewsProductsRouter from "./routes/views.routes.js";

const app = express();
app.use(express.json());

try {
    await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`);
    // Iniciar el servidor HTTP
    const serverHttp = app.listen(PORT, () =>
        console.log(`Server listening on port ${PORT}`)
    );
    // Crear una instancia de Socket.IO y vincularla al servidor HTTP
    const io = new Server(serverHttp);
    // Establecer el objeto "socketio" en la aplicación para que esté disponible en todas las rutas
    app.set("socketio", io);

    // Configurar el middleware para servir archivos estáticos desde la carpeta "public"
    app.use(express.static(`${__dirname}/public`));
    // Configurar el motor de plantillas Handlebars
    app.engine("handlebars", handlebars.engine());
    app.set("views", `${__dirname}/views`);
    app.set("view engine", "handlebars");

    // Ruta principal
    app.get("/", (req, res) => res.render("index", { name: "CoderHouse" }));
    // Rutas para la API de productos y carritos
    app.use("/api/products", productsRouter);
    app.use("/api/carts", cartsRouter);
    // Ruta para las vistas de productos
    app.use("/products", viewsProductsRouter);

    // Evento de conexión de Socket.IO
    io.on("connection", async (socket) => {
        // console.log("Successful Connection");
        // Escucha el evento "productList" emitido por el cliente
        socket.on("productList", (data) => {
            // Emitir el evento "updatedCarts" a todos los clientes conectados
            console.log(data);
            io.emit("updatedProducts", data);
        });
        socket.on("cartList", (data) => {
            // Emitir el evento "updatedCarts" a todos los clientes conectados
            io.emit("updatedCarts", data);
        });

        let messages = (await messageModel.find()) ? await messageModel.find() : [];

        socket.broadcast.emit("alerta");
        socket.emit("logs", messages);
        socket.on("message", (data) => {
            messages.push(data);
            messageModel.create(messages);
            io.emit("logs", messages);
        });
    });
} catch (error) {
    console.log(`Cannot connect to dataBase: ${error}`);
    process.exit();
}