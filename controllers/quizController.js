import MentalHealth from '../models/MentalHealth.js';

export const submitQuiz = async (req, res) => {
  try {
    const { score, result } = req.body;
    const userId = req.user._id;

    const newQuiz = new MentalHealth({ userId, score, result });
    await newQuiz.save();

    res.status(201).json({ message: 'Quiz submitted', quiz: newQuiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

export const getUserQuizHistory = async (req, res) => {
  try {
    const history = await MentalHealth.find({ userId: req.user._id }).sort({ submittedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
