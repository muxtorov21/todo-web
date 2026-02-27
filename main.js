const todoValue = document.getElementById('todo-value')
const todoAdd = document.getElementById('todo-add')
const todoList = document.getElementById('todo-list')
const advice = document.getElementById('advice-text')
const dogImg = document.getElementById('dog-img')
const ownerImg = document.getElementById('owner-img')
const ownerName = document.getElementById('owner-name')
const owner = document.getElementById('owner')
const newBtn = document.getElementById('new-advice')
const newDogBtn = document.getElementById('new-dog')
const allBtn = document.getElementById('all')
const completedBtn = document.getElementById('completed')
const pendingBtn = document.getElementById('pending')
let currentFilter = 'all'

const savedAdvice = localStorage.getItem('lastAdvice')
if (savedAdvice) {
	advice.innerText = 'Kun maslahati: ' + savedAdvice
}

const savedPet = JSON.parse(localStorage.getItem('lastPet'))
if (savedPet) {
	dogImg.src = savedPet.dog
	ownerName.innerText = savedPet.ownerName
	ownerImg.src = savedPet.ownerImg
	dogImg.style.opacity = '1'
	owner.innerText = 'Itni egasi'
}

let tasks = JSON.parse(localStorage.getItem('tasks')) || []

function renderTasks() {
	todoList.innerHTML = ''
	const allCount = tasks.length
	const completedCount = tasks.filter(task => {
		return task.completed === true
	}).length
	const pendingCount = allCount - completedCount

	allBtn.innerText = `Hammasi ${allCount}`
	completedBtn.innerText = `Bajarildi ${completedCount}`
	pendingBtn.innerHTML = `Kutilmoqda ${pendingCount}`

	const filteredTasks = tasks.filter(task => {
		if (currentFilter === 'completed') return task.completed
		if (currentFilter === 'pending') return !task.completed
		return true
	})

	filteredTasks.reverse().forEach(task => {
		const realIndex = tasks.indexOf(task)
		let newLi = document.createElement('li')
		newLi.className = `flex items-center justify-between p-4 mb-2 rounded-xl border transition-all cursor-pointer ${
			task.completed
				? 'bg-green-50 border-green-200'
				: 'bg-white border-blue-100 shadow-sm hover:shadow-md'
		}`
		newLi.innerHTML = `
            <div class="flex flex-col flex-1">
                <span class="text-lg leading-tight ${
									task.completed
										? 'line-through text-gray-400'
										: 'text-gray-700 font-medium'
								}">${task.text}</span>
                <div class="flex items-center gap-3 mt-1">
                    <span class="text-[11px] text-gray-400 font-medium">${
											task.date || 'Hozir'
										}</span>
                </div>
            </div>
						<button class="edit-btn ml-2 text-[11px] font-bold uppercase bg-blue-50 text-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all">Tahrirlash</button>
            <button class="ml-4 text-[11px] font-bold uppercase bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">O'chirish</button>
        `
		newLi.onclick = e => {
			const clickedText = e.target.innerText.toUpperCase()

			if (clickedText === "O'CHIRISH") {
				deleteTask(realIndex)
			} else if (clickedText === 'TAHRIRLASH') {
				editTask(realIndex)
			} else {
				toggleTask(realIndex)
			}
		}

		todoList.appendChild(newLi)
	})
}
function setFilter(f) {
	currentFilter = f
	renderTasks()
}

function editTask(index) {
	const oldText = tasks[index].text

	const newText = prompt('Vazifani tahrirlash:', oldText)

	if (newText !== null && newText.trim() !== '') {
		tasks[index].text = newText.trim()
		saveAndRender()
	}
}

function toggleTask(index) {
	tasks[index].completed = !tasks[index].completed
	saveAndRender()
}

function deleteTask(index) {
	tasks.splice(index, 1)
	saveAndRender()
}

function saveAndRender() {
	localStorage.setItem('tasks', JSON.stringify(tasks))
	renderTasks()
}

function getAdvice() {
	advice.innerText = 'yuklanmoqda...'
	fetch('https://api.adviceslip.com/advice')
		.then(res => res.json())
		.then(data => {
			const text = 'Kun maslahati: ' + data.slip.advice
			advice.innerText = text
			localStorage.setItem('lastAdvice', data.slip.advice)
		})
		.catch(err => console.log(err))
}

async function getPetAndOwner() {
	try {
		dogImg.style.opacity = '0.3'
		const [resUser, resDog] = await Promise.all([
			fetch('https://randomuser.me/api/'),
			fetch('https://dog.ceo/api/breeds/image/random'),
		])
		const resUserName = await resUser.json()
		const resDogImg = await resDog.json()

		const petData = {
			dog: resDogImg.message,
			ownerName: resUserName.results[0].name.first,
			ownerImg: resUserName.results[0].picture.medium,
		}

		dogImg.src = petData.dog
		ownerName.innerText = petData.ownerName
		ownerImg.src = petData.ownerImg

		localStorage.setItem('lastPet', JSON.stringify(petData))

		dogImg.onload = () => {
			dogImg.style.opacity = '1'
			owner.innerText = 'Itni egasi'
		}
	} catch (error) {
		console.log('Xato: ', error)
	}
}

todoAdd.addEventListener('click', () => {
	if (todoValue.value.trim() === '') return
	const now = new Date()
	const dateString = `${now.getDate().toString().padStart(2, '0')}.${(
		now.getMonth() + 1
	)
		.toString()
		.padStart(2, '0')} ${now.getHours()}:${now
		.getMinutes()
		.toString()
		.padStart(2, '0')}`

	tasks.push({ text: todoValue.value, completed: false, date: dateString })
	saveAndRender()
	todoValue.value = ''
})

newBtn.addEventListener('click', getAdvice)
newDogBtn.addEventListener('click', getPetAndOwner)

renderTasks()
if (!savedAdvice) getAdvice()
