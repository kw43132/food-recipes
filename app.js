// 1. วาง Web App URL จาก Google Apps Script ตรงนี้
const API_URL = "https://script.google.com/macros/s/AKfycbwj89jEHx-WbbDYbUdWBJfNsJ78i8iXiB5zRhtZMz2oq2kJ4_w35kQwc9VGFg55DkkmMA/exec";

let allRecipes = [];

// ดึงข้อมูลสูตรอาหารทั้งหมดมาจาก Google Sheets (Read)
async function fetchRecipes() {
    const loadingDiv = document.getElementById('loading');
    const listDiv = document.getElementById('recipeList');

    try {
        const response = await fetch(API_URL);
        allRecipes = await response.json();

        if (loadingDiv) loadingDiv.style.display = 'none';
        displayRecipes(allRecipes);
    } catch (error) {
        if (loadingDiv) loadingDiv.innerText = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
        console.error(error);
    }
}

// นำข้อมูลมาสร้างองค์ประกอบแสดงบนหน้าเว็บ
function displayRecipes(recipes) {
    const listDiv = document.getElementById('recipeList');
    listDiv.innerHTML = '';

    if (recipes.length === 0) {
        listDiv.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color:#78716c;">ไม่พบสูตรอาหาร</p>';
        return;
    }

    // แสดงเมนูล่าสุดขึ้นก่อน
    recipes.slice().reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = "recipe-card";

        card.innerHTML = `
            <div class="card-body">
                <span class="badge">${item.category || 'ทั่วไป'}</span>
                <h3>${item.recipeName}</h3>
                <p><strong>วัตถุดิบ:</strong><br>${item.ingredients}</p>
                <p><strong>วิธีทำ:</strong><br>${item.instructions}</p>
            </div>
        `;
        listDiv.appendChild(card);
    });
}

// ส่งข้อมูลฟอร์มไปยัง Google Sheets (Create)
document.getElementById('recipeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "กำลังบันทึกข้อมูล...";

    const formData = {
        recipeName: document.getElementById('recipeName').value,
        category: document.getElementById('category').value,
        ingredients: document.getElementById('ingredients').value,
        instructions: document.getElementById('instructions').value
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        alert("บันทึกสูตรอาหารเรียบร้อยแล้ว!");
        document.getElementById('recipeForm').reset();
        fetchRecipes(); // โหลดข้อมูลใหม่ทันที
    } catch (error) {
        alert("เกิดข้อผิดพลาดในการบันทึก");
        console.error(error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "บันทึกสูตรอาหาร";
    }
});

// ค้นหาข้อมูลเมนูอาหารขณะพิมพ์
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allRecipes.filter(item => 
        (item.recipeName && item.recipeName.toLowerCase().includes(keyword)) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(keyword))
    );
    displayRecipes(filtered);
});

// เรียกฟังก์ชันดึงข้อมูลเมื่อเปิดหน้าเว็บ
fetchRecipes();