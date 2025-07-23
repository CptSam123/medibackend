import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  const message = await Message.create({
    senderId: req.user.id,
    receiverId: req.body.receiverId,
    content: req.body.content
  });
  res.status(201).json(message);
};

export const getMessages = async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: userId },
      { senderId: userId, receiverId: req.user.id }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
};
