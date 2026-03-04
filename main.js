const todoValue = document.getElementById('todo-value')
const todoAdd = document.getElementById('todo-add')
const todoList = document.getElementById('todo-list')
const advice = document.getElementById('advice-text')
const newBtn = document.getElementById('new-advice')
const allBtn = document.getElementById('all')
const completedBtn = document.getElementById('completed')
const pendingBtn = document.getElementById('pending')
const searchInput = document.getElementById('search-panel')
const themeToggleBtn = document.getElementById('theme-toggle')
const darkIcon = document.getElementById('theme-toggle-dark-icon')
const lightIcon = document.getElementById('theme-toggle-light-icon')
const addSound = new Audio('sounds/freesound_crunchpixstudio-add-408457.mp3')
const deleteSound = new Audio(
	'sounds/spinopel-remove-charging-cable-into-smartphone-393112.mp3'
)
addSound.load()
deleteSound.load()
addSound.volume = 0.2
deleteSound.volume = 0.2
//  (STATE)
let currentFilter = 'all'
let tasks = JSON.parse(localStorage.getItem('tasks')) || []
let draggedItemIndex = null
//  THEME
function initTheme() {
	const isDark =
		localStorage.getItem('color-theme') === 'dark' ||
		(!('color-theme' in localStorage) &&
			window.matchMedia('(prefers-color-scheme: dark)').matches)

	if (isDark) {
		document.documentElement.classList.add('dark')
		lightIcon.classList.remove('hidden')
	} else {
		document.documentElement.classList.remove('dark')
		darkIcon.classList.remove('hidden')
	}
}
themeToggleBtn.addEventListener('click', () => {
	darkIcon.classList.toggle('hidden')
	lightIcon.classList.toggle('hidden')
	const isDark = document.documentElement.classList.toggle('dark')
	localStorage.setItem('color-theme', isDark ? 'dark' : 'light')
})
//  (HELPERS)
function updateStats() {
	const allCount = tasks.length
	const completedCount = tasks.filter(t => t.completed).length
	const pendingCount = allCount - completedCount

	allBtn.innerText = `Hammasi ${allCount}`
	completedBtn.innerText = `Bajarildi ${completedCount}`
	pendingBtn.innerHTML = `Kutilmoqda ${pendingCount}`
}

function saveAndRender() {
	localStorage.setItem('tasks', JSON.stringify(tasks))
	renderTasks()
}
// Create element
function createTaskElement(task) {
	const realIndex = tasks.indexOf(task)
	const newLi = document.createElement('li')
	newLi.draggable = true
	newLi.className = `task-animate flex items-center justify-between p-4 mb-2 rounded-xl border transition-all cursor-pointer ${
		task.completed
			? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
			: 'bg-white border-blue-100 shadow-sm hover:shadow-md dark:bg-slate-800 dark:border-slate-700'
	}`
	newLi.innerHTML = `
        <div class="flex flex-col flex-1 min-w-0 ">
            <span class="text-lg break-words overflow-hidden leading-tight ${
							task.completed
								? 'line-through text-gray-400 dark:text-gray-500'
								: 'text-gray-700 font-medium dark:text-gray-200'
						}">${task.text}</span>
            <div class="flex items-center gap-3 mt-1">
                <span class="text-[11px] text-gray-400 font-medium">${
									task.date || 'Hozir'
								}</span>
            </div>
        </div>
        <div class="flex flex-col gap-1">
            <button class="edit-btn ml-4 active:scale-95 transition-transform text-[11px] max-w-[90px] font-bold uppercase bg-blue-100 text-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all">Tahrirlash</button>
            <button class="delete-btn ml-4 text-[11px] max-w-[90px] w-full font-bold uppercase bg-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 active:scale-95 transition-transform hover:text-white transition-all">O'chirish</button>
        </div>
    `

	newLi.ondragstart = () => {
		draggedItemIndex = tasks.indexOf(task)
		newLi.classList.add('scale-105 color-red-100')
	}
	newLi.ondragover = e => {
		e.preventDefault()
		newLi.classList.add('border-t-4', 'border-blue-500')
	}

	newLi.ondragleave = () => {
		newLi.classList.remove('border-t-4', 'border-blue-500')
	}
	newLi.ondrop = () => {
		newLi.classList.remove('border-t-4', 'border-blue-500')
		const droppedItemIndex = tasks.indexOf(task)
		swapTasks(draggedItemIndex, droppedItemIndex)
	}
	// Click
	newLi.onclick = e => {
		const clickedText = e.target.innerText.toUpperCase()
		if (clickedText === "O'CHIRISH") {
			newLi.classList.add('task-exit')
			deleteSound.play()
			setTimeout(() => {
				newLi.remove()
				const index = tasks.indexOf(task)
				if (index > -1) {
					tasks.splice(index, 1)
					localStorage.setItem('tasks', JSON.stringify(tasks))
					updateStats()
				}
			}, 400)
		} else if (clickedText === 'TAHRIRLASH') {
			editTask(tasks.indexOf(task))
		} else {
			toggleTask(tasks.indexOf(task))
		}
	}
	return newLi
}
//  RENDER
function renderTasks() {
	todoList.innerHTML = ''
	updateStats()

	const searchText = searchInput.value.toLowerCase()
	const filteredTasks = tasks.filter(task => {
		const matchesFilter =
			currentFilter === 'completed'
				? task.completed
				: currentFilter === 'pending'
				? !task.completed
				: true
		const matchesSearch = task.text.toLowerCase().includes(searchText)
		return matchesFilter && matchesSearch
	})

	filteredTasks.reverse().forEach(task => {
		todoList.appendChild(createTaskElement(task))
	})
}
// (ACTIONS)
function deleteTask(index) {
	tasks.splice(index, 1)
	saveAndRender()
}

function toggleTask(index) {
	tasks[index].completed = !tasks[index].completed
	saveAndRender()
}

function editTask(index) {
	const newText = prompt('Vazifani tahrirlash:', tasks[index].text)
	if (newText && newText.trim()) {
		tasks[index].text = newText.trim()
		saveAndRender()
	}
}

function setFilter(f) {
	currentFilter = f
	renderTasks()
}

function swapTasks(fromIndex, toIndex) {
	if (fromIndex === toIndex) return
	const movedTask = tasks.splice(fromIndex, 1)[0]
	tasks.splice(toIndex, 0, movedTask)
	saveAndRender()
}
//  API VA HODISALAR
function getAdvice() {
	const adviceText = document.getElementById('advice-text')
	advice.innerText = 'yuklanmoqda...'
	fetch('https://api.adviceslip.com/advice')
		.then(res => res.json())
		.then(data => {
			adviceText.innerText = data.slip.advice
			localStorage.setItem('lastAdvice', data.slip.advice)
		})
}

window.addEventListener(
	'click',
	() => {
		addSound.load()
		deleteSound.load()
	},
	{ once: true }
)
todoAdd.addEventListener('click', async () => {
	if (!todoValue.value.trim()) return
	const now = new Date()
	const dateString = `${now.getDate().toString().padStart(2, '0')}.${(
		now.getMonth() + 1
	)
		.toString()
		.padStart(2, '0')} ${now.getHours()}:${now
		.getMinutes()
		.toString()
		.padStart(2, '0')}`

	const newTask = { text: todoValue.value, completed: false, date: dateString }
	tasks.push(newTask)
	try {
		addSound.currentTime = 0
		await addSound.play()
	} catch (err) {
		console.log('Ovoz chalishda xato:', err)
	}
	const newLi = createTaskElement(newTask)
	todoList.prepend(newLi)

	localStorage.setItem('tasks', JSON.stringify(tasks))
	updateStats()
	todoValue.value = ''
})
// INIT
searchInput.addEventListener('input', renderTasks)
newBtn.addEventListener('click', getAdvice)

initTheme()
renderTasks()

const savedAdvice = localStorage.getItem('lastAdvice')

if (!savedAdvice) {
	getAdvice()
} else {
	const adviceTextSpan = document.getElementById('advice-text')
	if (adviceTextSpan) {
		adviceTextSpan.innerText = savedAdvice
	}
}
