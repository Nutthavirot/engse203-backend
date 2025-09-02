const express = require('express');

const app = express();

const PORT = 3001;

const cors = require('cors');
app.use(cors());

let agents = [
   {
    code: "A001",        // รหัส Agent
    name: "Nutthavirot",         // เติมคิดเอง
    status: "Available",       // เติมคิดเอง  
    loginTime: new Date()
   },
   {
    code: "A002",        // รหัส Agent
    name: "Mo",         // เติมคิดเอง
    status: "Wrap up",       // เติมคิดเอง  
    loginTime: new Date()
   },
   {
    code: "A003",        // รหัส Agent
    name: "Gun",         // เติมคิดเอง
    status: "Active",       // เติมคิดเอง  
    loginTime: new Date()
   },
];

//อธิบาย: Middleware นี้ทำหน้าที่แปลง JSON ที่ส่งมาใน request body ให้เป็น JavaScript object
app.use(express.json());

//URL: http://localhost:3001/api/agents/A001/status
app.patch('/api/agents/:code/status', (req, res) => {
    // Step 1: ดึง agent code จาก URL
    const agentCode = req.params.code; // เติม

    // Step 2: ดึง status ใหม่จาก body
    const newStatus = req.body.status; // เติม
    
    console.log('Agent Code:', agentCode);
    console.log('New Status:', newStatus);
    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    // Step 3: หา agent ในระบบ
    const agent = agents.find(a => a.code === agentCode);
    
    console.log('found agent:', agent);

    // Step 4: ตรวจสอบว่าเจอ agent ไหม?
    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found"
        });
    }

     // Step 5: ตรวจสอบว่า status ที่ส่งมาถูกต้องไหม?
    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status",
            validStatuses: validStatuses
        });
    }  
    
    // Step 6: บันทึกสถานะเดิมไว้ (เพื่อ log)
    const oldStatus = agent.status;

    // Step 7: เปลี่ยน status
    agent.status = newStatus;
    agent.lastStatusChange = new Date();
    
    console.log('current agent :', agent);

    // Step 8: ส่ง response กลับ
    res.json({
        success: true,
        message: `Agent ${agentCode} status changed from ${oldStatus} to ${newStatus}`,
        data: agent
    });


});

app.get('/api/dashboard/stats', (req, res) => {
    // ขั้นที่ 1: นับจำนวนรวม
    const totalAgents = agents.length;
    
    // ขั้นที่ 2: นับจำนวนตามสถานะ
    const available = agents.filter(a => a.status === "Available").length;
    const active = agents.filter(a => a.status === "Active").length;
    const wrapUp = agents.filter(a => a.status === "WrapUp").length;
    const notReady = agents.filter(a => a.status === "NotReady").length;
    const offline = agents.filter(a => a.status === "Offline").length;
    
    // ขั้นที่ 3: คำนวณเปอร์เซ็นต์
    const calcPercent = (count) => totalAgents > 0 ? Math.round((count / totalAgents) * 100) : 0;

    const response = {
        success: true,
        data: {
            total: totalAgents,
            statusBreakdown: {
                available: { count: available, percent: calcPercent(available) },
                active: { count: active, percent: calcPercent(active) },
                wrapUp: { count: wrapUp, percent: calcPercent(wrapUp) },
                notReady: { count: notReady, percent: calcPercent(notReady) },
                offline: { count: offline, percent: calcPercent(offline) }
            },
            timestamp: new Date().toISOString()
        }
    };

    res.json(response);
});


app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;
    
    // ให้นักศึกษาเขียนเอง:
    // 1. หา agent หรือสร้างใหม่
    const agent = agents.find(a => a.code === agentCode);
    console.log('found agent:', agent);
        // ถ้าไม่เจอ → สร้างใหม่
    if (!agent) {
        agent = { code: agentCode };
        agents.push(agent);
    }
    // 2. เซ็ต status เป็น "Available"  
    agent.name = name;                     // เก็บชื่อ agent
    agent.status = "Available";            // เปลี่ยนสถานะเป็น Available
    agent.loginTime = new Date();          // เก็บเวลา login

    // 3. บันทึก loginTime
    agent.loginTime = new Date();  
    // 4. ส่ง response
    res.json(agent);
});

app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;
    // 1. หา agent 
    const agent = agents.find(a => a.code === agentCode);
    console.log('found agent:', agent);

    // 2.  เซ็ต status เป็น "Offline
    agent.name = name;
    agent.status = "Offline";
    agent.logoutTime = new Date();
    // 3. บันทึก logoutTime
    agent.logoutTime = new Date();  
    // 4. ลบ loginTime 
    delete agent.loginTime;
    // 4. ส่ง response
    res.json(agent);

})


app.get('/api/agents', (req, res) => {
   
    res.json({
        success: true,     // เติม true/false
        data: agents,        // เติม agents หรือไม่?
        count: agents.length,       // เติมจำนวน agents
        timestamp: new Date().toISOString()    // เติมเวลาปัจจุบัน
    });

});

app.get('/api/agents/count', (req, res) => {
   
    res.json({
        success: true,     // เติม true/false
        count: agents.length,       // เติมจำนวน agents
        timestamp: new Date().toISOString()    // เติมเวลาปัจจุบัน
    });

});


app.get('/', (req, res) => {
    res.send(`Hello Agent Wallboard!`);
});

app.get('/hello', (req, res) => {
    res.send(`Hello สวัสดี!`);
});

app.get('/health', (req, res) => {
    res.send({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
