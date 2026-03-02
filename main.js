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

let currentFilter = 'all'

// Theme Logic
if (
	localStorage.getItem('color-theme') === 'dark' ||
	(!('color-theme' in localStorage) &&
		window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
	document.documentElement.classList.add('dark')
	lightIcon.classList.remove('hidden')
	darkIcon.classList.add('hidden')
} else {
	document.documentElement.classList.remove('dark')
	darkIcon.classList.remove('hidden')
	lightIcon.classList.add('hidden')
}

themeToggleBtn.addEventListener('click', function () {
	darkIcon.classList.toggle('hidden')
	lightIcon.classList.toggle('hidden')
	if (document.documentElement.classList.contains('dark')) {
		document.documentElement.classList.remove('dark')
		localStorage.setItem('color-theme', 'light')
	} else {
		document.documentElement.classList.add('dark')
		localStorage.setItem('color-theme', 'dark')
	}
})

// Advice Logic
const savedAdvice = localStorage.getItem('lastAdvice')
if (savedAdvice) {
	advice.innerText = 'Kun maslahati: ' + savedAdvice
}

let tasks = JSON.parse(localStorage.getItem('tasks')) || []

function renderTasks() {
	todoList.innerHTML = ''
	const allCount = tasks.length
	const completedCount = tasks.filter(task => task.completed).length
	const pendingCount = allCount - completedCount

	allBtn.innerText = `Hammasi ${allCount}`
	completedBtn.innerText = `Bajarildi ${completedCount}`
	pendingBtn.innerHTML = `Kutilmoqda ${pendingCount}`

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
		const realIndex = tasks.indexOf(task)
		let newLi = document.createElement('li')
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
		newLi.onclick = e => {
			const clickedText = e.target.innerText.toUpperCase()

			if (clickedText === "O'CHIRISH") {
				newLi.classList.add('task-exit')

				setTimeout(() => {
					deleteTask(realIndex)
				}, 400)
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

searchInput.addEventListener('input', () => renderTasks())

function editTask(index) {
	const newText = prompt('Vazifani tahrirlash:', tasks[index].text)
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
			advice.innerText = 'Kun maslahati: ' + data.slip.advice
			localStorage.setItem('lastAdvice', data.slip.advice)
		})
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
renderTasks()
if (!savedAdvice) getAdvice()
