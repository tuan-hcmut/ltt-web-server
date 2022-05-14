const User = require("./../../models/usersModel");

const initSockets = (io) => {
  let clients = {};
  let rooms = {};
  let roomsInfor = {};
  io.on("connection", (socket) => {
    console.log("Socket connected!!");

    socket.on("get-list-online", () => {
      socket.emit("list-online", { clients, rooms, roomsInfor });
    });

    socket.on("add-user", (data) => {
      if (data.data) {
        data.data.socketId = socket.id;
        clients[data.data._id] = data.data;
      }
      // console.log(clients);
    });

    socket.on("disconnect", () => {
      let roomId;

      Object.keys(clients).forEach((el) => {
        if (clients[el].socketId === socket.id) {
          delete clients[el];
          return;
        }
      });

      Object.keys(rooms).forEach((el) => {
        if (rooms[el].includes(socket.id)) {
          roomId = el;
          delete rooms[el];
          return;
        }
      });

      if (roomId) delete roomsInfor[roomId];
    });

    socket.on("add-caro-room", (data) => {
      let message;
      if (!rooms[data["room-id"]]) {
        rooms[data["room-id"]] = [socket.id];
        roomsInfor[data["room-id"]] = data;
        socket.join(data["room-id"]);
        message = "success";
      } else {
        message = "fail";
      }
      socket.emit("res-add-caro-room", { message, data });
    });

    socket.on("join-room", (data) => {
      if (rooms[data] && rooms[data].length === 1) {
        let enemy;
        Object.keys(clients).forEach((el) => {
          if (clients[el].socketId === socket.id) {
            enemy = clients[el];
            return;
          }
        });
        if (enemy.coin < roomsInfor[data].deposit * 1)
          return socket.emit("res-join-room", { message: "Khong Du Coin!!!" });

        rooms[data].push(socket.id); ///// get socket host before push enemy socket
        socket.join(data);
        io.in(data).emit("res-join-room", { message: "success", data });
      } else {
        socket.emit("res-join-room", { message: "Phong day!!!" });
      }
    });

    socket.on("infor-battle", (data) => {
      let enemy;
      let host;
      if (rooms[data])
        Object.keys(clients).forEach((el) => {
          if (clients[el].socketId === rooms[data][0]) host = clients[el];
          if (clients[el].socketId === rooms[data][1]) enemy = clients[el];
          if (enemy && host) return;
        });

      io.in(data).emit("res-infor-battle", {
        enemy,
        host,
        boardInfor: roomsInfor[data],
        socket: rooms[data],
      });

      socket.on("next-step", (data) => {
        io.in(data.roomId).emit("res-next-step", {
          board: data.board,
          nextTurn: data.nextTurn,
        });
      });
    });

    socket.on("chat", (data) => {
      data.player.content = data.chat; //// add new feild conent to the data.playerObj
      data.content[data.content.length] = data.player; //////add new obj to the content arr
      io.in(data.roomId).emit("res-chat", {
        data: data.content,
      });
    });

    socket.on("win", async (data) => {
      try {
        let enemy;
        let host;

        Object.keys(clients).forEach((el) => {
          if (clients[el].socketId === rooms[data.roomId][0])
            host = clients[el];
          if (clients[el].socketId === rooms[data.roomId][1])
            enemy = clients[el];
          if (enemy && host) return;
        });

        if (enemy.socketId === data.socketId) {
          await User.findByIdAndUpdate(enemy._id, {
            coin: enemy.coin + data.deposit * 1,
          });
          await User.findByIdAndUpdate(host._id, {
            coin: host.coin - data.deposit * 1,
          });
        } else {
          await User.findByIdAndUpdate(enemy._id, {
            coin: enemy.coin - data.deposit * 1,
          });
          await User.findByIdAndUpdate(host._id, {
            coin: host.coin + data.deposit * 1,
          });
        }

        io.in(data.roomId).emit("res-win", {
          weapon: data.weapon,
          deposit: data.deposit * 1,
        });
      } catch (e) {}
    });
  });
};

module.exports = initSockets;
