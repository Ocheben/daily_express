let news;
let newsList;
let currentPage = 1;
let carouselIndex = 0;
let newsId;
let sliderRunning = false;
let commentId;
let editComment = false;

const request = (method, url, data) => {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };
    return fetch(url, opts).then(res => res.json())
      .then(response => response)
      .catch(error => alert('There seems to be a problem with your connection'));
};

const getSlides = async () => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${newsId}/images`;
  const method = 'GET';
  const images = await request(method, url);
  const imgSlides = images.map(item => `
    <img src="${item.image}" class="slide" alt="Slide Image" />
  `).join('')
  document.getElementById('slide-container').innerHTML = imgSlides;
  if(sliderRunning === false) {
    carousel();
  }
}

const getComments = async () => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${newsId}/comments`;
  const method = 'GET';
  const comments = await request(method, url);
  const commentsList = comments.map(item => `
    <div class="comment">
      <img src="${item.avatar}" alt="avatar" />
      <div class="message">
          <h4>${item.name}</h4>
          <p class="date">${new Date(item.createdAt).toDateString()}</p>
          <p>${item.comment}</p>
          <button class="btn"><i class="material-icons" onclick="toggleModal('commentModal', true); commentId=${item.id}; editComment = true" >edit</i></button>
          <button class="btn"><i class="material-icons" onclick="toggleModal('deleteCommentModal', true); commentId=${item.id}" >delete</i></button>
      </div>
    </div>
  `).join('');
  document.getElementById('comments-container').innerHTML = commentsList;

}
const getStory = async () => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${newsId}`;
  const method = 'GET';
  const newsObject = await request(method, url);
  document.getElementById('story').innerHTML = newsObject.title || 'Loading...';

}

const getPage = async(page, next) => {
  currentPage = next ? page + 1 : page > 1 ? page - 1 : page;
  const loader = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
  document.getElementById('newsListContainer').innerHTML = loader
  const method = 'GET'
    const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news?page=${currentPage}&limit=5`;
    news = await request(method, url);
    if (news.length === 0) {
      document.getElementById('newsListContainer').innerHTML = `<h3>No Data Available</h3>`
      currentPage = page
      return;
    }
    const newsList = `
        ${news.map(item =>`
        <a class="item-card" href="/news.html?id=${item.id}">
          <img class="newsImg" src="${item.avatar}"/>
          <div class="news-info">
            <h3 >${item.title}</h3>
            <div>
              <p>Authour: ${item.author || 'Anonymous'}</p>
              <p>Published: ${new Date(item.createdAt).toDateString()}</p>
            </div>
          </div>
      </a>
        `).join('')}
    `
    document.getElementById('newsListContainer').innerHTML = newsList
    document.getElementById('currentPage').innerHTML = currentPage
}

const postComment = async (method) => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${newsId}/comments/${method === 'POST' ? '' : commentId }`;
  const commentName = document.getElementById('comment-name').value;
  const commentAvatar = document.getElementById('comment-avatar').value;
  const commentMessage = document.getElementById('comment-message').value;
  const data = {
    newsId,
    name: commentName,
    avatar: commentAvatar,
    comment: commentMessage
  }
  const response = await request(method, url, data);
  getComments();
  if(method === 'DELETE') {
    toggleModal('deleteCommentModal', false);
  } else {
  toggleModal('commentModal', false);
  document.getElementById('comment-name').value = '';
  document.getElementById('comment-avatar').value = '';
  document.getElementById('comment-message').value = '';

  }
}
const postNews = async (method) => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${method === 'POST' ? '' : newsId }`;
  const newsAuthor = document.getElementById('news-author').value;
  const newsAvatar = document.getElementById('news-avatar').value;
  const newsTitle = document.getElementById('news-title').value;
  const newsUrl = document.getElementById('news-url').value;
  const data = {
    author: newsAuthor,
    avatar: newsAvatar,
    title: newsTitle,
    url: newsUrl
  }
  const response = await request(method, url, data);
  if(method === 'POST'){
    getPage(currentPage+1);
    toggleModal('newsModal', false);
  } else {
    toggleModal('editNewsModal', false);
    window.location.reload()
  }
  document.getElementById('news-author').value = '';
  document.getElementById('news-avatar').value = '';
  document.getElementById('news-title').value = '';
  document.getElementById('news-url').value = '';
}

const deleteNews = async () => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${newsId}`;
  const method = 'DELETE';
  const response = await request(method, url);
  window.location.pathname= '/';
} 
const postImage = async () => {
  const url = `http://5d2c2f2b8c90070014972225.mockapi.io/api/v2/news/${newsId}/images`;
  const method = 'POST';
  const imageUrl = document.getElementById('image-url').value;
  const data = {
    newsId,
    image: imageUrl
  }
  const response = await request(method, url, data);
  window.location.reload()
}

const carousel = () => {
  let i;
  sliderRunning = true
  const slides = document.getElementsByClassName("slide");
  if(slides.length === 0) return
  for (i = 0; i < slides.length; i++) {
    if(slides.length > 0) slides[i].style.display = "none";  
  }
  carouselIndex++;
  if (carouselIndex > slides.length) {carouselIndex = 1}    
  slides[carouselIndex-1].style.display = "block";  
  setTimeout(carousel, 2000);
}

const toggleModal = (modalId, open) => {
  const modal = document.getElementById(modalId);
  open === true ?
  modal.style.display = "flex" :
  modal.style.display = "none"
}

const startNewsPage = () => {
  newsId = new URLSearchParams(window.location.search).get('id');
  getSlides();
  getComments();
  getStory();
}

const startApp = async() => {
  window.location.pathname === '/news.html' ?
  startNewsPage() :
  getPage(0, true);
}

startApp();
