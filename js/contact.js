(function () {
  var contactForm = document.getElementById("contactForm");
  var contactMsg = document.getElementById("contactMsg");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = contactForm.name.value.trim();
    var email = contactForm.email.value.trim();
    var message = contactForm.message.value.trim();
    if (!name || !email || !message) {
      contactMsg.textContent = "请完整填写姓名、邮箱与留言。";
      contactMsg.style.color = "#b23a2f";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      contactMsg.textContent = "邮箱格式不正确。";
      contactMsg.style.color = "#b23a2f";
      return;
    }
    contactMsg.style.color = "#8fbf8a";
    contactMsg.textContent = "已收到留言（演示站点仅前端提示，未实际上送）。";
    contactForm.reset();
  });
})();
