// Application state
let workouts = [];
let weeklyGoals = { workouts: 3, calories: 1500 };

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    updateProgress();
    updateCharts();
    setDefaultDate();
});

// Set today's date as default
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Handle form submission
document.getElementById('workoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addWorkout();
});

// Add new workout
function addWorkout() {
    const workoutType = document.getElementById('workoutType').value;
    const duration = parseInt(document.getElementById('duration').value);
    const calories = parseInt(document.getElementById('calories').value);
    const date = document.getElementById('date').value;

    const workout = {
        id: Date.now(),
        type: workoutType,
        duration: duration,
        calories: calories,
        date: date
    };

    workouts.unshift(workout);
    saveData();
    updateStats();
    updateProgress();
    updateCharts();
    displayWorkouts();
    
    // Reset form
    document.getElementById('workoutForm').reset();
    setDefaultDate();
    
    // Show success animation
    showNotification('Workout added successfully! 🎉');
}

// Display workouts list
function displayWorkouts() {
    const workoutsList = document.getElementById('workoutsList');
    
    if (workouts.length === 0) {
        workoutsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No workouts recorded yet. Add your first workout above!</p>';
        return;
    }

    workoutsList.innerHTML = workouts.map(workout => `
        <div class="workout-item fade-in">
            <div class="workout-info">
                <h3>${workout.type}</h3>
                <div class="workout-details">
                    <span>📅 ${formatDate(workout.date)}</span>
                    <span>⏱️ ${workout.duration} min</span>
                    <span>🔥 ${workout.calories} cal</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteWorkout(${workout.id})">Delete</button>
        </div>
    `).join('');
}

// Delete workout
function deleteWorkout(id) {
    workouts = workouts.filter(workout => workout.id !== id);
    saveData();
    updateStats();
    updateProgress();
    updateCharts();
    displayWorkouts();
    showNotification('Workout deleted! 🗑️');
}

// Update statistics
function updateStats() {
    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(workouts.reduce((sum, workout) => sum + workout.duration, 0) / totalWorkouts) : 0;

    document.getElementById('totalWorkouts').textContent = totalWorkouts;
    document.getElementById('totalCalories').textContent = totalCalories;
    document.getElementById('avgDuration').textContent = avgDuration;
}

// Update progress bars
function updateProgress() {
    const currentWeek = getCurrentWeekWorkouts();
    const weeklyWorkouts = currentWeek.length;
    const weeklyCalories = currentWeek.reduce((sum, workout) => sum + workout.calories, 0);

    const workoutProgress = Math.min((weeklyWorkouts / weeklyGoals.workouts) * 100, 100);
    const calorieProgress = Math.min((weeklyCalories / weeklyGoals.calories) * 100, 100);

    document.getElementById('workoutProgress').style.width = workoutProgress + '%';
    document.getElementById('calorieProgress').style.width = calorieProgress + '%';
}

// Get current week workouts
function getCurrentWeekWorkouts() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startOfWeek;
    });
}

// Update charts
function updateCharts() {
    updateWeeklyChart();
    updateWorkoutTypesChart();
}

// Update weekly chart
function updateWeeklyChart() {
    const weeklyData = Array(7).fill(0);
    const currentWeek = getCurrentWeekWorkouts();

    currentWeek.forEach(workout => {
        const workoutDate = new Date(workout.date);
        const dayIndex = workoutDate.getDay();
        weeklyData[dayIndex] += workout.calories;
    });

    const maxCalories = Math.max(...weeklyData, 100);
    const chartBars = document.querySelectorAll('#weeklyChart .chart-bar');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    chartBars.forEach((bar, index) => {
        const height = (weeklyData[index] / maxCalories) * 250 + 20;
        bar.style.height = height + 'px';
        bar.title = `${days[index]}: ${weeklyData[index]} calories`;
    });
}

// Update workout types chart
function updateWorkoutTypesChart() {
    const typesChart = document.getElementById('workoutTypesChart');
    
    if (workouts.length === 0) {
        typesChart.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No data available yet. Start tracking workouts to see your activity breakdown!</p>';
        return;
    }

    const typeCounts = {};
    workouts.forEach(workout => {
        typeCounts[workout.type] = (typeCounts[workout.type] || 0) + 1;
    });

    const total = workouts.length;
    typesChart.innerHTML = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span>${type}</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="background: #e0e0e0; border-radius: 10px; height: 10px; width: 100px;">
                            <div style="background: linear-gradient(45deg, #667eea, #764ba2); height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.5s ease;"></div>
                        </div>
                        <span style="font-size: 0.9rem; color: #666;">${count} (${percentage}%)</span>
                    </div>
                </div>
            `;
        }).join('');
}

// Set new goals
function setGoals() {
    const newWorkoutGoal = prompt('Enter weekly workout goal:', weeklyGoals.workouts);
    const newCalorieGoal = prompt('Enter weekly calorie goal:', weeklyGoals.calories);

    if (newWorkoutGoal && newCalorieGoal) {
        weeklyGoals.workouts = parseInt(newWorkoutGoal);
        weeklyGoals.calories = parseInt(newCalorieGoal);
        
        document.getElementById('workoutGoalValue').textContent = weeklyGoals.workouts;
        document.getElementById('calorieGoalValue').textContent = weeklyGoals.calories;
        
        updateProgress();
        saveData();
        showNotification('Goals updated successfully! 🎯');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Show notification
function showNotification(message) {
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4facfe, #00f2fe);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save data to memory (replacing localStorage)
function saveData() {
    // In a real application, this would save to localStorage
    // For this demo, data persists only during the session
    window.fitnessAppData = {
        workouts: workouts,
        weeklyGoals: weeklyGoals
    };
}

// Load data from memory
function loadData() {
    if (window.fitnessAppData) {
        workouts = window.fitnessAppData.workouts || [];
        weeklyGoals = window.fitnessAppData.weeklyGoals || { workouts: 3, calories: 1500 };
        
        document.getElementById('workoutGoalValue').textContent = weeklyGoals.workouts;
        document.getElementById('calorieGoalValue').textContent = weeklyGoals.calories;
        
        displayWorkouts();
    }
}