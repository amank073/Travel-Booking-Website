let searchBtn = document.querySelector('#search-btn');
let searchBar = document.querySelector('.search-bar-container');
let formBtn = document.querySelector('#login-btn');
let loginForm = document.querySelector('.login-form-container');
let formClose = document.querySelector('#form-close');
let menu = document.querySelector('#menu-bar');
let navbar = document.querySelector('.navbar');
let videoBtn = document.querySelectorAll('.vid-btn');

window.onscroll = () => {
    searchBtn.classList.remove('fa-times');
    searchBar.classList.remove('active');
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
    loginForm.classList.remove('active');
};

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

searchBtn.onclick = () => {
    searchBtn.classList.toggle('fa-times');
    searchBar.classList.toggle('active');
};

formBtn.onclick = () => loginForm.classList.add('active');
formClose.onclick = () => loginForm.classList.remove('active');

videoBtn.forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.controls .active').classList.remove('active');
        btn.classList.add('active');
        document.querySelector('#video-slider').src = btn.getAttribute('data-src');
    };
});

new Swiper(".review-slider", {
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 2500 },
    breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
    }
});

new Swiper(".brand-slider", {
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 2500 },
    breakpoints: {
        450: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        991: { slidesPerView: 4 },
        1200: { slidesPerView: 5 }
    }
});

document.querySelectorAll('.book-package').forEach(btn => {
    btn.onclick = e => {
        e.preventDefault();
        document.getElementById('placeName').value = btn.dataset.place;
        document.querySelector('#book').scrollIntoView({ behavior: 'smooth' });
    };
});

let guestInput = document.getElementById('guestCount');
let extraPassContainer = document.getElementById('extraPassengers');

guestInput.oninput = () => {
    let total = Math.max(1, parseInt(guestInput.value) || 1);
    extraPassContainer.innerHTML = "";
    for (let i = 2; i <= total; i++) {
        extraPassContainer.innerHTML += `
            <div class="inputBox extra-passenger-input">
                <h4>Passenger ${i} Name</h4>
                <input type="text">
            </div>`;
    }
};

function calculateFare(guests, place) {
    let usdToInr = 84;
    const fareUSD = {
        "Mumbai": 100,
        "Hawaii": 110,
        "Sydney": 80,
        "Paris": 100,
        "Tokyo": 90,
        "Egypt": 70
    };
    return (fareUSD[place] || 120) * usdToInr * guests;
}

document.getElementById('bookingForm').onsubmit = e => {
    e.preventDefault();

    let currentUser = (localStorage.getItem("loggedInUser") || "").trim().toLowerCase();
    if (!currentUser) {
        alert("You must login before booking!");
        loginForm.classList.add("active");
        return;
    }

    let name = document.getElementById('mainName').value.trim();
    let place = document.getElementById('placeName').value.trim();
    let guests = parseInt(guestInput.value) || 1;
    let arrival = document.getElementById('arrivalDate').value;
    let leaving = document.getElementById('leavingDate').value;

    if (!name || !place || !arrival || !leaving) {
        alert("Fill all fields");
        return;
    }

    document.getElementById('sumName').innerHTML = name;
    document.getElementById('sumPlace').innerHTML = place;
    document.getElementById('sumArrival').innerHTML = arrival;
    document.getElementById('sumLeaving').innerHTML = leaving;

    let fare = calculateFare(guests, place);
    let bookingID = generateBookingID();
    document.getElementById("sumID").innerHTML = bookingID;

    document.getElementById("sumFare").innerHTML =
        "₹" + fare.toLocaleString("en-IN");

    document.getElementById("bookingSummary").style.display = "block";


    let allBookings = JSON.parse(localStorage.getItem("bookings") || "{}");
    if (!allBookings[currentUser]) allBookings[currentUser] = [];

    allBookings[currentUser].push({
        bookingID,
        name,
        place,
        guests,
        arrival,
        leaving,
        fare
    });

    localStorage.setItem("bookings", JSON.stringify(allBookings));
    let extraInputs = extraPassContainer.querySelectorAll("input");
    let passengerTextRow = document.getElementById("passengerTextRow");
    let passengerText = document.getElementById("passengerText");

    let finalNames = [name];
    extraInputs.forEach(i => {
        let val = i.value.trim();
        if (val !== "") finalNames.push(val);
    });

    if (finalNames.length > 1) {
        passengerTextRow.style.display = "block";
        passengerText.innerHTML = finalNames.slice(1).join(", ");
    } else {
        passengerTextRow.style.display = "none";
    }
};

document.getElementById("downloadPDF").onclick = () => {
    let ticket = document.querySelector(".ticket-container");

    html2canvas(ticket).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jspdf.jsPDF("p", "mm", "a4");

        let width = pdf.internal.pageSize.getWidth();
        let height = (canvas.height * width) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save("My_Ticket.pdf");
    });
};

document.getElementById("showRegister").onclick = (e) => {
    e.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
};

document.getElementById("showLogin").onclick = (e) => {
    e.preventDefault();
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
};

document.getElementById("registerForm").onsubmit = (e) => {
    e.preventDefault();

    let email = document.getElementById("regEmail").value.trim().toLowerCase();
    let pass = document.getElementById("regPassword").value.trim();

    if (!email || !pass) return alert("Fill all fields!");

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === email)) return alert("Account already exists!");

    users.push({ email, password: pass });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully!");
    document.getElementById("showLogin").click();
};

document.getElementById("loginForm").onsubmit = (e) => {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value.trim().toLowerCase();
    let pass = document.getElementById("loginPassword").value.trim();

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find(u => u.email === email && u.password === pass);

    if (!user) return alert("Invalid email or password!");

    localStorage.setItem("loggedInUser", email);

    alert("Login successful!");
    loginForm.classList.remove("active");
    updateHeaderUser();
};

function updateHeaderUser() {
    let user = localStorage.getItem("loggedInUser");

    if (user) {
        document.getElementById("logout-icon").style.display = "inline-block";
        document.getElementById("myBookingsLink").style.display = "inline-block";
    } else {
        document.getElementById("logout-icon").style.display = "none";
        document.getElementById("myBookingsLink").style.display = "none";
    }
}
updateHeaderUser();

document.getElementById("logout-icon").onclick = () => {
    localStorage.removeItem("loggedInUser");
    updateHeaderUser();
    alert("Logged out successfully!");
};

document.getElementById("contactForm").onsubmit = (e) => {
    e.preventDefault();

    let name = document.getElementById("cName").value.trim();
    let email = document.getElementById("cEmail").value.trim();
    let number = document.getElementById("cNumber").value.trim();
    let subject = document.getElementById("cSubject").value.trim();
    let message = document.getElementById("cMessage").value.trim();

    if (!name || !email || !number || !subject || !message) {
        alert("Please fill all fields!");
        return;
    }

    alert("Message sent successfully!");
    document.getElementById("contactForm").reset();
};

function loadBookings() {
    if (!document.getElementById("bookingList")) return;

    let user = (localStorage.getItem("loggedInUser") || "").toLowerCase();
    let allBookings = JSON.parse(localStorage.getItem("bookings") || "{}");
    let list = document.getElementById("bookingList");

    if (!user || !allBookings[user] || allBookings[user].length === 0) {
        list.innerHTML = "<p>No bookings available.</p>";
        return;
    }

    let html = "";
    allBookings[user].forEach((b, index) => {
        html += `
        <div style="padding:1.5rem; margin-bottom:1rem; border-left:5px solid #ffa500; background:#fff3e6; border-radius:8px;">
            <strong>Booking ${index + 1}</strong><br>
            <strong>Name:</strong> ${b.name}<br>
            <strong>Destination:</strong> ${b.place}<br>
            <strong>Guests:</strong> ${b.guests}<br>
            <strong>Arrival:</strong> ${b.arrival}<br>
            <strong>Leaving:</strong> ${b.leaving}<br>
            <strong>Total Fare:</strong> ₹${b.fare.toLocaleString("en-IN")}<br><br>

            <button onclick="deleteBooking(${index})"
            style="padding:8px 15px; background:#ff4444; color:white; 
                   border:none; font-size:16px; cursor:pointer; border-radius:6px;">
                Delete Booking
            </button>
        </div>`;
    });

    list.innerHTML = html;
}

function deleteBooking(i) {
    let user = (localStorage.getItem("loggedInUser") || "").toLowerCase();
    let allBookings = JSON.parse(localStorage.getItem("bookings") || "{}");

    allBookings[user].splice(i, 1);
    localStorage.setItem("bookings", JSON.stringify(allBookings));

    loadBookings();
}

document.getElementById("bsClose").onclick = () => {
    document.getElementById("bookingSummary").style.display = "none";
};

function generateBookingID() {
    return "GA-" + Math.floor(100000 + Math.random() * 900000);
}



(function () {
    let bookings = JSON.parse(localStorage.getItem("bookings") || "{}");
    let newBookings = {};

    for (let key in bookings) {

        if (!key || key === "null" || key === "undefined" || key.trim() === "") {
            continue;
        }

        let cleanKey = key.trim().toLowerCase();

        if (!Array.isArray(bookings[key])) {
            continue;
        }

        if (!newBookings[cleanKey]) newBookings[cleanKey] = [];

        bookings[key].forEach(b => {
            if (b && b.bookingID && b.name) {
                newBookings[cleanKey].push(b);
            }
        });
    }

    localStorage.setItem("bookings", JSON.stringify(newBookings));
})();
