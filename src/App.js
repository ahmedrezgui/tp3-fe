import logo from './logo.svg';
import './App.css';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { useState } from 'react';



const socket = io('http://localhost:3000');
function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [activeMessage, setActiveMessage] = useState(null);


  const messageListener = (message) => {
    setMessages((prev) => [...prev, { text: message, comments: [], likes: 0, emojis: [] }]);
  }

  const commentListener = (data) => {
    const updatedMessages = messages.map((msg, index) => {
      if (index === data.msgIndex) {
        return {
          ...msg,
          comments: [...msg.comments, data.comment]
        };
      }
      return msg;
    });
    setMessages(updatedMessages);
  }

  const likeListener = ({ msgId, likes }) => {
    setMessages(prevMessages => prevMessages.map((msg, index) => {
      if (index === msgId) {
        return { ...msg, likes: likes };
      }
      console.log(msg);
      return msg;
    }));
  }

  const emojiListener = ({ msgId, emoji }) => {
    setMessages(prevMessages => prevMessages.map((msg, index) => {
      if (index === msgId) {
        return { ...msg, emojis: [...msg.emojis, emoji] };
      }
      return msg;
    }))
  }

  useEffect(() => {

    // Listen for incoming messages
    socket.on('message', messageListener);

    // Listen for incoming comments
    socket.on('comment-message', commentListener);


    socket.on('like-message', likeListener);


    socket.on('emoji-message', emojiListener);




    // socket.on('user-joined', (data) => messageListener(data.text));

    // socket.on('user-left', (data) => messageListener(data.text));

    // socket.on('connect', (data) => messageListener('Connected'));

    return () => {
      socket.off('message', messageListener);
      socket.off('comment-message', commentListener);
      socket.off('like-message', likeListener);
      socket.off('emoji-message', emojiListener);

    }

  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() != '') {
      socket?.emit('message', input);
      setInput('');
    }
  };

  const handleCommentSubmit = (e, msgIndex) => {
    e.preventDefault();
    if (commentInput.trim() !== '') {
      socket?.emit('comment-message', { msgIndex, comment: commentInput });
      setCommentInput('');
    }
  };

  const handleLike = (msgId, likes) => {
    likes = likes + 1;
    socket.emit('like-message', { msgId, likes });
  };

  const handleEmoji = (msgId, emoji) => {
    socket.emit('emoji-message', { msgId, emoji });
  };


  return (
    <div>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.text}
            <button onClick={() => handleLike(index, msg.likes)}>Like ({msg.likes})</button>
            <button onClick={() => handleEmoji(index, '👍')}>👍</button>
            <button onClick={() => handleEmoji(index, '❤️')}>❤️</button>
            <ul>
              {msg.comments.map((comment, commentIndex) => (
                <li key={commentIndex}>{comment}</li>
              ))}
              <li>
                <form onSubmit={(e) => handleCommentSubmit(e, index)}>
                  <input value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
                  <button type="submit">Comment</button>
                </form>
              </li>
            </ul>

            <ul>
              {msg.emojis.map((emoji, emojiIndex) => (
                <li key={emojiIndex}>{emoji}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};



export default App;
