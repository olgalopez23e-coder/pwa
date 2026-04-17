require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Friend = require('./src/models/Friend');

(async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemonpru';
    await mongoose.connect(mongoURI);

    const users = await User.find({}, 'email friendCode pushSubscription').lean();
    console.log('USERS:', users.length);
    users.forEach(u => console.log(u.email, u.friendCode, u.pushSubscription ? 'SUB' : 'NO SUB'));

    const badFriends = await Friend.find({
      $or: [
        { friendId: null },
        { friendId: { $exists: false } },
        { userId: null },
        { userId: { $exists: false } }
      ]
    }).lean();
    console.log('BAD FRIENDS:', badFriends.length);

    const duplicates = await Friend.aggregate([
      { $group: { _id: { userId: '$userId', friendId: '$friendId' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log('DUPLICATE PAIRS:', duplicates.length);

    const count = await Friend.countDocuments();
    console.log('TOTAL FRIEND DOCS:', count);

    await mongoose.connection.close();
  } catch (error) {
    console.error('ERROR:', error);
  }
})();
