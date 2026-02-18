document.addEventListener('DOMContentLoaded', () => {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const attendance = JSON.parse(localStorage.getItem('attendance')) || {};
    const leaves = JSON.parse(localStorage.getItem('leaves')) || {};

    const saveData = () => {
        localStorage.setItem('employees', JSON.stringify(employees));
        localStorage.setItem('attendance', JSON.stringify(attendance));
        localStorage.setItem('leaves', JSON.stringify(leaves));
    };

    const renderEmployees = () => {
        const list = document.getElementById('emp-list');
        list.innerHTML = '';
        employees.forEach(emp => {
            const li = document.createElement('li');
            li.textContent = `${emp.name} (ID: ${emp.id}, Dept: ${emp.dept}, Salary: $${emp.salary})`;
            list.appendChild(li);
        });
    };

    const updateSelects = () => {
        const selects = ['update-select', 'leave-select', 'payroll-select'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            select.innerHTML = '<option value="">Select Employee</option>';
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.id;
                option.textContent = emp.name;
                select.appendChild(option);
            });
        });
    };

    // Add Employee
    document.getElementById('add-employee-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('emp-name').value;
        const id = document.getElementById('emp-id').value;
        const dept = document.getElementById('emp-dept').value;
        const salary = parseFloat(document.getElementById('emp-salary').value);
        employees.push({ name, id, dept, salary });
        saveData();
        renderEmployees();
        updateSelects();
        e.target.reset();
    });

    // Update Employee
    document.getElementById('update-select').addEventListener('change', (e) => {
        const emp = employees.find(emp => emp.id === e.target.value);
        if (emp) {
            document.getElementById('update-employee-form').style.display = 'block';
            document.getElementById('update-name').value = emp.name;
            document.getElementById('update-id').value = emp.id;
            document.getElementById('update-dept').value = emp.dept;
            document.getElementById('update-salary').value = emp.salary;
        }
    });

    document.getElementById('update-employee-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('update-id').value;
        const emp = employees.find(emp => emp.id === id);
        if (emp) {
            emp.name = document.getElementById('update-name').value;
            emp.dept = document.getElementById('update-dept').value;
            emp.salary = parseFloat(document.getElementById('update-salary').value);
            saveData();
            renderEmployees();
            updateSelects();
            e.target.style.display = 'none';
        }
    });

    // Track Attendance
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('current-date').textContent = today;
    const renderAttendance = () => {
        const list = document.getElementById('attendance-list');
        list.innerHTML = '';
        employees.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'attendance-item';
            div.innerHTML = `
                <strong>${emp.name}</strong>
                <button onclick="markAttendance('${emp.id}', 'present')" class="btn btn-success">Present</button>
                <button onclick="markAttendance('${emp.id}', 'absent')" class="btn btn-danger">Absent</button>
                <span id="status-${emp.id}">${attendance[today]?.[emp.id] || 'Not Marked'}</span>
            `;
            list.appendChild(div);
        });
    };
    window.markAttendance = (id, status) => {
        if (!attendance[today]) attendance[today] = {};
        attendance[today][id] = status;
        document.getElementById(`status-${id}`).textContent = status;
        saveData();
    };
    renderAttendance();

    // Leave Apply
    document.getElementById('apply-leave-btn').addEventListener('click', () => {
        const id = document.getElementById('leave-select').value;
        const start = document.getElementById('leave-start').value;
        const end = document.getElementById('leave-end').value;
        if (id && start && end) {
            if (!leaves[id]) leaves[id] = [];
            leaves[id].push({ start, end });
            saveData();
            alert('Leave applied successfully!');
        }
    });

    // Payroll Calculation
    document.getElementById('calculate-payroll-btn').addEventListener('click', () => {
        const id = document.getElementById('payroll-select').value;
        const emp = employees.find(emp => emp.id === id);
        if (emp) {
            const month = new Date().getMonth();
            const year = new Date().getFullYear();
            let daysWorked = 0;
            let leaveDays = 0;

            // Count attendance
            for (let date in attendance) {
                const d = new Date(date);
                if (d.getMonth() === month && d.getFullYear() === year && attendance[date][id] === 'present') {
                    daysWorked++;
                }
            }

            // Count leaves
            if (leaves[id]) {
                leaves[id].forEach(leave => {
                    const start = new Date(leave.start);
                    const end = new Date(leave.end);
                    if (start.getMonth() === month && start.getFullYear() === year) {
                        leaveDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    }
                });
            }

            const totalDays = 30; // Assume 30 days
            const dailyRate = emp.salary / totalDays;
            const grossPay = daysWorked * dailyRate;
            const deductions = leaveDays * dailyRate;
            const netPay = grossPay - deductions;

            document.getElementById('payroll-result').innerHTML = `
                <p><strong>Days Worked:</strong> ${daysWorked}</p>
                <p><strong>Leave Days:</strong> ${leaveDays}</p>
                <p><strong>Gross Pay:</strong> $${grossPay.toFixed(2)}</p>
                <p><strong>Deductions:</strong> $${deductions.toFixed(2)}</p>
                <p><strong>Net Pay:</strong> $${netPay.toFixed(2)}</p>
            `;
        }
    });

    renderEmployees();
    updateSelects();
});