// --- Sistem Layouting & Scaling 16:9 ---
        function resizeGame() {
            const wrapper = document.getElementById('game-wrapper');
            const targetRatio = 16 / 9;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const windowRatio = windowWidth / windowHeight;

            let scale = 1;
            if (windowRatio < targetRatio) {
                // Layar lebih sempit dari 16:9 (berdasarkan lebar)
                scale = windowWidth / 1280; 
            } else {
                // Layar lebih lebar dari 16:9 (berdasarkan tinggi)
                scale = windowHeight / 720;
            }
            wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
        window.addEventListener('resize', resizeGame);
        window.addEventListener('orientationchange', () => { setTimeout(resizeGame, 100); });
        resizeGame(); // Init

        // --- State Management ---
        const savedState = JSON.parse(localStorage.getItem('ecoChefState') || '{}');
        const state = {
            soundEnabled: savedState.soundEnabled !== false,
            currentScreen: 'home',
            completedMissions: Array.isArray(savedState.completedMissions) ? savedState.completedMissions : [],
            m3IngredientsAdded: { rice: 0, egg: 0, onionR: 0, onionW: 0, chili: 0, soy: 0, oil: 0, salt: 0, pepper: 0, greenOnion: 0 },
            m4Order: [],
            quizScore: Number(savedState.quizScore) || 0,
            quizCorrect: Number(savedState.quizCorrect) || 0
        };

        function saveGameState() {
            localStorage.setItem('ecoChefState', JSON.stringify(state));
        }

        // --- Audio Engine (Web Audio API) ---
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        function playSound(type) {
            if (!state.soundEnabled) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;
            
            switch (type) {
                case 'click':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1);
                    break;
                case 'pop':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1);
                    break;
                case 'drop':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15);
                    break;
                case 'success':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.setValueAtTime(600, now + 0.1);
                    osc.frequency.setValueAtTime(800, now + 0.2);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.4);
                    osc.start(now); osc.stop(now + 0.4);
                    break;
                case 'error':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.linearRampToValueAtTime(150, now + 0.2);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                    break;
                case 'stir':
                    // Pseudo-noise for stirring
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(100, now);
                    osc.frequency.linearRampToValueAtTime(300, now + 0.2);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.4);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.5);
                    osc.start(now); osc.stop(now + 0.5);
                    break;
                case 'win':
                    osc.type = 'triangle';
                    const notes = [440, 554, 659, 880]; // A, C#, E, A
                    notes.forEach((freq, i) => {
                        osc.frequency.setValueAtTime(freq, now + i * 0.15);
                    });
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.8);
                    osc.start(now); osc.stop(now + 0.8);
                    break;
            }
        }

        function toggleAudio() {
            state.soundEnabled = !state.soundEnabled;
            document.getElementById('btn-audio').innerHTML = state.soundEnabled ? '🔊' : '🔇';
            if(state.soundEnabled && audioCtx.state === 'suspended') audioCtx.resume();
            saveGameState();
            playSound('click');
        }

        // --- Navigasi & UI Umum ---
        function navTo(screenId) {
            playSound('click');
            const destinations = {
                home: 'bk.html',
                'mission-1': 'dekomposisi.html',
                'mission-2': 'pengenalanpola.html',
                'mission-3': 'abstraksi.html',
                'mission-4': 'algoritma.html',
                quiz: 'quiz.html',
                certificate: 'sertifikat.html'
            };
            if (destinations[screenId]) {
                saveGameState();
                window.location.href = destinations[screenId];
            }
        }

        function toggleFullscreen() {
            playSound('click');
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        }

        function showGuide() {
            playSound('click');
            document.getElementById('modal-guide').classList.add('active');
        }
        
        function closeModal(id) {
            playSound('click');
            document.getElementById(id).classList.remove('active');
        }

        function showAlert(title, msg, type, actionsHTML = null) {
            const modal = document.getElementById('modal-alert');
            document.getElementById('alert-title').innerHTML = title;
            document.getElementById('alert-msg').innerHTML = msg;
            
            let icon = 'ℹ️';
            if(type === 'success') { icon = '🎉'; playSound('success'); }
            else if(type === 'error') { icon = '❌'; playSound('error'); }
            else { playSound('pop'); }
            document.getElementById('alert-icon').innerHTML = icon;

            const actions = document.getElementById('alert-actions');
            if (actionsHTML) {
                actions.innerHTML = actionsHTML;
            } else {
                actions.innerHTML = `<button class="btn btn-blue w-32" onclick="closeModal('modal-alert')">OK</button>`;
            }
            modal.classList.add('active');
        }

        function markMissionComplete(num) {
            if(!state.completedMissions.includes(num)) {
                state.completedMissions.push(num);
                saveGameState();
            }
        }

        // --- Sistem Drag & Drop Global ---
        let draggedElement = null;
        let sourceContainerId = null;

        function drag(ev) {
            draggedElement = ev.target;
            sourceContainerId = ev.target.parentElement.id;
            ev.dataTransfer.setData("text", ev.target.id);
            playSound('pop');
            ev.dataTransfer.effectAllowed = "move";
        }

        function allowDrop(ev) {
            ev.preventDefault();
            ev.currentTarget.classList.add('drag-over');
        }

        // Delegasi drop ditangani di fungsi spesifik misi karena logikanya berbeda
        document.addEventListener('dragleave', (ev) => {
            if(ev.target.classList && ev.target.classList.contains('dropzone')) {
                ev.target.classList.remove('drag-over');
            }
        });

        // Alternatif Klik untuk layar sentuh
        let selectedItemForMove = null;
        function handleItemClick(ev) {
            const item = ev.currentTarget;
            if(selectedItemForMove === item) {
                // Batal pilih
                item.style.boxShadow = "none";
                selectedItemForMove = null;
            } else {
                if(selectedItemForMove) selectedItemForMove.style.boxShadow = "none";
                selectedItemForMove = item;
                item.style.boxShadow = "0 0 0 4px #3B82F6";
                playSound('pop');
            }
        }

        function handleDropzoneClick(ev) {
            const zone = ev.currentTarget;
            if(selectedItemForMove) {
                // Simulasikan drop
                selectedItemForMove.style.boxShadow = "none";
                zone.appendChild(selectedItemForMove);
                playSound('drop');
                
                // Trigger event manual jika diperlukan
                if(zone.id.startsWith('m4-slot')) validateM4Slot(zone);
                if(zone.id === 'm1-target') document.getElementById('m1-placeholder').style.display = 'none';
                
                selectedItemForMove = null;
            }
        }

        const m1Data = [
            { id: 'm1-c1', text: 'Siapkan alat & bahan', icon: '🍳', correct: true },
            { id: 'm1-c2', text: 'Masukkan bahan', icon: '🧅', correct: true },
            { id: 'm1-c3', text: 'Aduk hingga rata', icon: '🥄', correct: true },
            { id: 'm1-c4', text: 'Sajikan', icon: '🍽️', correct: true },
            { id: 'm1-c5', text: 'Merapikan kasur', icon: '🛏️', correct: false },
            { id: 'm1-c6', text: 'Menyikat gigi', icon: '🪥', correct: false },
            { id: 'm1-c7', text: 'Ganti pakaian', icon: '👕', correct: false }
        ];

        function initM1() {
            const source = document.getElementById('m1-source');
            const target = document.getElementById('m1-target');
            source.innerHTML = '';
            target.innerHTML = '<span class="text-gray-400 select-none pointer-events-none absolute" id="m1-placeholder">Tempelkan 4 kartu kegiatan di sini</span>';
            
            // Acak array
            let shuffled = m1Data.sort(() => 0.5 - Math.random());
            
            shuffled.forEach(item => {
                let card = document.createElement('div');
                card.id = item.id;
                card.className = 'draggable bg-white border-2 border-gray-300 rounded-lg p-2 text-center w-28 h-28 flex flex-col justify-center shadow hover:bg-blue-50';
                card.draggable = true;
                card.dataset.correct = item.correct;
                card.ondragstart = drag;
                card.onclick = handleItemClick;
                card.innerHTML = `<div class="text-4xl mb-1">${item.icon}</div><div class="text-xs font-bold leading-tight">${item.text}</div>`;
                source.appendChild(card);
            });
            target.onclick = handleDropzoneClick;
            source.onclick = handleDropzoneClick;
        }

        function drop(ev, type) {
            ev.preventDefault();
            const zone = ev.currentTarget;
            zone.classList.remove('drag-over');
            if(draggedElement) {
                zone.appendChild(draggedElement);
                playSound('drop');
                if(zone.id === 'm1-target') {
                    document.getElementById('m1-placeholder').style.display = 'none';
                }
                draggedElement = null;
            }
        }

        function checkM1() {
            const target = document.getElementById('m1-target');
            const items = target.querySelectorAll('.draggable');
            let correctCount = 0;
            let wrongCount = 0;

            if (items.length !== 4) {
                showAlert('Belum Lengkap', 'Pilih tepat 4 kegiatan yang berhubungan dengan memasak nasi goreng.', 'warning');
                return;
            }

            items.forEach(item => {
                if (item.dataset.correct === 'true') {
                    item.classList.add('bg-green-100', 'border-green-500');
                    correctCount++;
                } else {
                    item.classList.add('bg-red-100', 'border-red-500');
                    wrongCount++;
                }
            });

            if (correctCount === 4) {
                markMissionComplete(1);
                showAlert('Berhasil!', 'Kamu memecah masalah besar (memasak nasi goreng) menjadi bagian kecil yang tepat. Ini namanya <b>Dekomposisi</b>!', 'success', 
                `<button class="btn btn-blue" onclick="navTo('home'); closeModal('modal-alert')">Kembali ke Home</button>
                 <button class="btn btn-green" onclick="navTo('mission-2'); closeModal('modal-alert')">Lanjut Misi 2</button>`);
            } else {
                showAlert('Ada yang kurang tepat', 'Beberapa kegiatan tidak berhubungan dengan memasak nasi goreng. Coba pisahkan yang salah.', 'error',
                `<button class="btn btn-orange" onclick="closeModal('modal-alert')">Perbaiki</button>`);
            }
        }

        function initM2() {
            const container = document.getElementById('m2-data-container');
            container.innerHTML = '';
            for(let i=0; i<=5; i++) {
                let spoons = '';
                for(let j=0; j<i*2; j++) spoons += '<span class="text-red-500 text-xs inline-block -ml-1">🥄</span>';
                if(spoons==='') spoons = '-';
                
                container.innerHTML += `
                <div class="bg-white border rounded p-1 text-center w-[16%] shadow-sm">
                    <div class="font-bold text-xs bg-gray-200 rounded mb-1">Level ${i}</div>
                    <div class="text-2xl mb-1">${i===0?'🍚':'🍛'}</div>
                    <div class="h-6 flex flex-wrap justify-center overflow-hidden mb-1">${spoons}</div>
                    <div class="text-[10px] font-bold">${i*2} sendok</div>
                </div>`;
            }
            
            document.querySelectorAll('input[name="m2-q1"]').forEach(r => r.checked = false);
            document.querySelectorAll('input[name="m2-q2"]').forEach(r => r.checked = false);
            document.getElementById('m2-part2').classList.add('opacity-50', 'pointer-events-none');
            const btn = document.getElementById('btn-check-m2');
            btn.innerHTML = '✔️ Periksa Pola';
            btn.onclick = checkM2_Part1;
        }

        function checkM2_Part1() {
            const q1 = document.querySelector('input[name="m2-q1"]:checked');
            if(!q1) return showAlert('Peringatan', 'Pilih pola yang kamu temukan terlebih dahulu!', 'warning');
            
            if(q1.value === '2') {
                playSound('success');
                document.getElementById('m2-part2').classList.remove('opacity-50', 'pointer-events-none');
                const btn = document.getElementById('btn-check-m2');
                btn.innerHTML = '✔️ Jawab Level 6';
                btn.onclick = checkM2_Part2;
                document.getElementById('btn-check-m2').classList.replace('btn-blue', 'btn-green');
            } else {
                showAlert('Kurang Tepat', 'Coba perhatikan perubahan angkanya: 0 -> 2 -> 4 -> 6. Berapa bedanya?', 'error');
            }
        }

        function checkM2_Part2() {
            const q2 = document.querySelector('input[name="m2-q2"]:checked');
            if(!q2) return showAlert('Peringatan', 'Pilih prediksi jumlah sendok untuk Level 6!', 'warning');
            
            if(q2.value === '12') {
                markMissionComplete(2);
                showAlert('Hebat!', 'Kamu menggunakan <b>Pengenalan Pola</b> untuk memprediksi data baru. Level 5 butuh 10, ditambah 2 pola, jadi Level 6 butuh 12 sendok!', 'success',
                `<button class="btn btn-blue" onclick="navTo('home'); closeModal('modal-alert')">Kembali ke Home</button>
                 <button class="btn btn-green" onclick="navTo('mission-3'); closeModal('modal-alert')">Lanjut Misi 3</button>`);
            } else {
                showAlert('Kurang Tepat', 'Jika Level 5 butuh 10 sendok, dan polanya bertambah 2. Maka 10 + 2 = ?', 'error');
            }
        }

        const m3Ing = [
            { id: 'rice', name: 'Nasi Putih', icon: '🍚', limit: 1 },
            { id: 'egg', name: 'Telur', icon: '🥚', limit: 1 },
            { id: 'onionR', name: 'Bawang Merah', icon: '🧅', limit: 1 },
            { id: 'onionW', name: 'Bawang Putih', icon: '🧄', limit: 1 },
            { id: 'chili', name: 'Cabai (1x klik=1)', icon: '🌶️', limit: 3 }, // pesanan minta level 3 (3 sendok)
            { id: 'soy', name: 'Kecap', icon: '🍾', limit: 1 },
            { id: 'oil', name: 'Minyak', icon: '🛢️', limit: 1 },
            { id: 'salt', name: 'Garam', icon: '🧂', limit: 1 },
            { id: 'pepper', name: 'Merica', icon: '🌶️', limit: 1 },
            { id: 'greenOnion', name: 'Daun Bawang', icon: '🥬', limit: 1, trap: true } // Jebakan
        ];

        function initM3() {
            state.m3IngredientsAdded = { rice: 0, egg: 0, onionR: 0, onionW: 0, chili: 0, soy: 0, oil: 0, salt: 0, pepper: 0, greenOnion: 0 };
            document.getElementById('m3-wok-contents').innerHTML = '';
            document.getElementById('m3-wok-status').innerHTML = 'Wajan kosong. Klik bahan untuk memasukkan.';
            document.getElementById('btn-m3-cook').classList.add('btn-disabled');
            document.getElementById('m3-abstraction-panel').classList.add('opacity-50', 'pointer-events-none');
            
            const panel = document.getElementById('m3-ingredients-panel');
            panel.innerHTML = '';
            m3Ing.forEach(i => {
                panel.innerHTML += `
                <div class="w-[30%] bg-white border rounded p-1 text-center cursor-pointer hover:bg-gray-100 flex flex-col items-center justify-center select-none" onclick="addIngredientM3('${i.id}')" id="ing-${i.id}">
                    <div class="text-2xl">${i.icon}</div>
                    <div class="text-[10px] leading-tight font-bold">${i.name}</div>
                    <div id="count-${i.id}" class="text-xs text-blue-600 font-bold hidden">0</div>
                </div>`;
            });
            
            // Init Part 2 cards
            const infoCards = [
                {id:'info-1', text:'Menu Nasi Goreng', imp: true},
                {id:'info-2', text:'Level Pedas', imp: true},
                {id:'info-3', text:'Tanpa Daun Bawang', imp: true},
                {id:'info-4', text:'Warna Wajan Hitam', imp: false},
                {id:'info-5', text:'Merek Kompor ABC', imp: false},
                {id:'info-6', text:'Bentuk Piring', imp: false}
            ];
            const cardContainer = document.getElementById('m3-info-cards');
            cardContainer.innerHTML = '';
            document.getElementById('m3-drop-important').innerHTML = '';
            document.getElementById('m3-drop-unimportant').innerHTML = '';
            
            infoCards.sort(() => 0.5 - Math.random()).forEach(c => {
                let div = document.createElement('div');
                div.id = c.id;
                div.className = 'draggable bg-blue-100 border border-blue-400 rounded px-2 py-1 text-xs m-1 cursor-grab';
                div.draggable = true;
                div.dataset.imp = c.imp;
                div.innerText = c.text;
                div.ondragstart = drag;
                div.onclick = handleItemClick;
                cardContainer.appendChild(div);
            });
            
            document.getElementById('m3-drop-important').onclick = handleDropzoneClick;
            document.getElementById('m3-drop-unimportant').onclick = handleDropzoneClick;
        }

        function addIngredientM3(id) {
            playSound('pop');
            const item = m3Ing.find(i => i.id === id);
            
            if(id === 'greenOnion') {
                showAlert('Ups!', 'Coba baca tiket pesanan lagi. Pelanggan minta <b>Tanpa Daun Bawang</b>!', 'warning');
                return;
            }

            if(state.m3IngredientsAdded[id] < item.limit) {
                state.m3IngredientsAdded[id]++;
                
                // Visual feedback di tombol bahan
                const countDiv = document.getElementById(`count-${id}`);
                countDiv.classList.remove('hidden');
                countDiv.innerText = state.m3IngredientsAdded[id] + 'x';
                if(state.m3IngredientsAdded[id] === item.limit) document.getElementById(`ing-${id}`).classList.add('opacity-50');

                // Visual di wajan
                document.getElementById('m3-wok-contents').innerHTML += `<span class="text-xl animate-[pop_0.2s_ease-out] drop-shadow-md">${item.icon}</span>`;
            }

            checkM3CookReady();
        }

        function checkM3CookReady() {
            let ready = true;
            m3Ing.forEach(i => {
                if(!i.trap && state.m3IngredientsAdded[i.id] < i.limit) ready = false;
            });

            const btn = document.getElementById('btn-m3-cook');
            if(ready) {
                document.getElementById('m3-wok-status').innerHTML = '<span class="text-green-600 font-bold">Semua bahan siap! Klik Aduk!</span>';
                btn.classList.remove('btn-disabled');
            }
        }

        function cookM3() {
            if(document.getElementById('btn-m3-cook').classList.contains('btn-disabled')) return;
            
            playSound('stir');
            const wok = document.getElementById('m3-wok-area');
            wok.classList.add('animate-[stir_0.5s_infinite]');
            document.getElementById('btn-m3-cook').innerHTML = 'Sedang memasak...';
            document.getElementById('btn-m3-cook').classList.add('btn-disabled');

            setTimeout(() => {
                wok.classList.remove('animate-[stir_0.5s_infinite]');
                wok.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-5xl">🍛</div>';
                document.getElementById('m3-wok-status').innerHTML = 'Nasi Goreng Selesai!';
                playSound('success');
                
                // Buka part 2
                setTimeout(() => {
                    document.getElementById('m3-abstraction-panel').classList.remove('opacity-50', 'pointer-events-none');
                    showAlert('Tahap 1 Selesai', 'Sekarang, dari kegiatan tadi, kelompokkan mana informasi yang <b>penting</b> untuk masak, dan mana yang <b>tidak penting</b> (bisa diabaikan).', 'info');
                }, 1000);

            }, 2000);
        }

        function checkM3_Part2() {
            const impZone = document.getElementById('m3-drop-important');
            const unimpZone = document.getElementById('m3-drop-unimportant');
            
            const impCards = impZone.querySelectorAll('.draggable');
            const unimpCards = unimpZone.querySelectorAll('.draggable');
            const leftCards = document.getElementById('m3-info-cards').querySelectorAll('.draggable');

            if(leftCards.length > 0) return showAlert('Peringatan', 'Kelompokkan semua kartu informasi terlebih dahulu!', 'warning');

            let allCorrect = true;
            impCards.forEach(c => { if(c.dataset.imp !== 'true') allCorrect = false; });
            unimpCards.forEach(c => { if(c.dataset.imp !== 'false') allCorrect = false; });

            if(allCorrect && impCards.length === 3 && unimpCards.length === 3) {
                markMissionComplete(3);
                showAlert('Luar Biasa!', 'Kamu berhasil melakukan <b>Abstraksi</b>! Yaitu fokus pada informasi penting (menu, pedas, catatan) dan mengabaikan yang tidak relevan (warna wajan, merek, bentuk piring).', 'success',
                `<button class="btn btn-blue" onclick="navTo('home'); closeModal('modal-alert')">Kembali ke Home</button>
                 <button class="btn btn-green" onclick="navTo('mission-4'); closeModal('modal-alert')">Lanjut Misi 4</button>`);
            } else {
                showAlert('Kurang Tepat', 'Ada informasi yang salah kamar. Ingat, abstraksi fokus pada yang memengaruhi rasa/pesanan.', 'error');
            }
        }

        const m4Steps = [
            { id: 's1', txt: 'Siapkan alat & bahan', icon: '🔪', order: 1 },
            { id: 's2', txt: 'Panaskan wajan & minyak', icon: '🔥', order: 2 },
            { id: 's3', txt: 'Orak-arik telur', icon: '🥚', order: 3 },
            { id: 's4', txt: 'Tumis bumbu (bawang)', icon: '🧅', order: 4 },
            { id: 's5', txt: 'Masukkan nasi & aduk', icon: '🍚', order: 5 },
            { id: 's6', txt: 'Beri kecap, garam, merica', icon: '🧂', order: 6 },
            { id: 's7', txt: 'Aduk hingga matang', icon: '🥄', order: 7 },
            { id: 's8', txt: 'Sajikan di piring', icon: '🍛', order: 8 }
        ];

        function initM4() {
            const source = document.getElementById('m4-source');
            const target = document.getElementById('m4-target');
            source.innerHTML = '';
            target.innerHTML = '';
            
            // Buat slot target
            for(let i=1; i<=8; i++) {
                let slot = document.createElement('div');
                slot.className = 'bg-white border-2 border-dashed border-red-300 rounded p-1 flex items-center min-h-[40px] dropzone';
                slot.id = `m4-slot-${i}`;
                slot.innerHTML = `<span class="bg-red-200 text-red-800 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs shrink-0">${i}</span><div class="flex-1 empty-zone"></div>`;
                slot.ondragover = allowDrop;
                slot.ondrop = (e) => dropM4(e, slot);
                slot.onclick = handleDropzoneClick;
                target.appendChild(slot);
            }

            // Acak sumber
            let shuffled = [...m4Steps].sort(() => 0.5 - Math.random());
            shuffled.forEach(item => {
                let block = document.createElement('div');
                block.id = item.id;
                block.className = 'draggable bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded p-2 flex items-center shadow cursor-grab text-sm font-bold border-l-4 border-blue-700';
                block.draggable = true;
                block.dataset.order = item.order;
                block.ondragstart = drag;
                block.onclick = handleItemClick;
                block.innerHTML = `<span class="mr-2 text-xl">${item.icon}</span> <span>${item.txt}</span>`;
                source.appendChild(block);
            });
            
            source.onclick = handleDropzoneClick;
            document.getElementById('m4-anim-fire').style.opacity = 0;
            document.getElementById('m4-anim-contents').innerHTML = '';
            document.getElementById('m4-anim-plate').style.opacity = 0;
            document.getElementById('m4-anim-result').style.opacity = 0;
            document.getElementById('btn-run-m4').classList.remove('btn-disabled');
            document.getElementById('m4-anim-text').innerText = 'Susun semua langkah, lalu klik Jalankan.';
        }

        function dropM4(ev, slot) {
            ev.preventDefault();
            slot.classList.remove('drag-over');
            if(draggedElement) {
                const container = slot.querySelector('.empty-zone') || slot;
                // Jika slot sudah isi, tukar (kembalikan yang lama ke source)
                if(container.querySelector('.draggable')) {
                    document.getElementById('m4-source').appendChild(container.querySelector('.draggable'));
                }
                container.appendChild(draggedElement);
                playSound('drop');
                draggedElement = null;
            }
        }
        
        // Memastikan slot divalidasi setelah click-to-drop
        function validateM4Slot(zone) {
            const container = zone.querySelector('.empty-zone') || zone;
            const items = container.querySelectorAll('.draggable');
            if(items.length > 1) {
                 document.getElementById('m4-source').appendChild(items[0]);
            }
        }

        function runAlgorithm() {
            const target = document.getElementById('m4-target');
            let currentOrder = [];
            let allFilled = true;

            for(let i=1; i<=8; i++) {
                const slot = document.getElementById(`m4-slot-${i}`);
                const item = slot.querySelector('.draggable');
                if(!item) { allFilled = false; break; }
                currentOrder.push(parseInt(item.dataset.order));
            }

            if(!allFilled) return showAlert('Belum Selesai', 'Isi semua 8 langkah terlebih dahulu sebelum menjalankan!', 'warning');

            // Cek kebenaran urutan ketat (1,2,3...8)
            let isCorrect = true;
            for(let i=0; i<8; i++) {
                if(currentOrder[i] !== i+1) {
                    isCorrect = false;
                    document.getElementById(`m4-slot-${i+1}`).classList.add('bg-red-100');
                    setTimeout(() => document.getElementById(`m4-slot-${i+1}`).classList.remove('bg-red-100'), 1000);
                }
            }

            if(!isCorrect) {
                playSound('error');
                return showAlert('Ada Bug!', 'Urutan algoritmamu ada yang salah. Perhatikan logika memasak yang benar (misal: panaskan wajan sebelum masukkan telur). Blok merah menunjukkan posisi yang salah.', 'error');
            }

            // Jika benar, jalankan animasi berurutan
            document.getElementById('btn-run-m4').classList.add('btn-disabled');
            playM4Animation(0);
        }

        function playM4Animation(stepIndex) {
            if(stepIndex >= 8) {
                markMissionComplete(4);
                playSound('win');
                document.getElementById('m4-anim-text').innerText = "Nasi Goreng Siap!";
                setTimeout(()=> {
                    showAlert('Misi Sukses!', 'Hebat! Kamu berhasil menyusun <b>Algoritma</b>. Algoritma adalah langkah-langkah yang berurutan dan logis untuk menyelesaikan masalah.', 'success',
                    `<button class="btn btn-purple text-xl py-3 px-6" onclick="navTo('home'); closeModal('modal-alert')">🏆 Ambil Tantangan Akhir</button>`);
                }, 1000);
                return;
            }

            const stepData = m4Steps[stepIndex];
            document.getElementById('m4-anim-text').innerHTML = `Langkah ${stepIndex+1}: <br><span class="text-blue-600">${stepData.txt}</span>`;
            const wokContents = document.getElementById('m4-anim-contents');
            const fire = document.getElementById('m4-anim-fire');
            
            // Logika Visual Animasi per langkah
            switch(stepIndex + 1) {
                case 1: playSound('click'); break; // Siap bahan
                case 2: fire.style.opacity = 1; playSound('stir'); break; // Panaskan
                case 3: wokContents.innerHTML += '🥚'; playSound('pop'); break; // Telur
                case 4: wokContents.innerHTML += '🧅'; playSound('pop'); break; // Bumbu
                case 5: wokContents.innerHTML += '🍚'; playSound('drop'); break; // Nasi
                case 6: wokContents.innerHTML += '🧂'; playSound('pop'); break; // Kecap
                case 7: 
                    playSound('stir');
                    document.getElementById('m4-anim-wok').classList.add('animate-[stir_0.3s_infinite]');
                    break;
                case 8:
                    document.getElementById('m4-anim-wok').classList.remove('animate-[stir_0.3s_infinite]');
                    fire.style.opacity = 0;
                    wokContents.innerHTML = '';
                    document.getElementById('m4-anim-plate').style.opacity = 1;
                    document.getElementById('m4-anim-result').style.opacity = 1;
                    playSound('success');
                    break;
            }

            // Highlight slot aktif
            document.querySelectorAll('[id^="m4-slot-"]').forEach(el => el.classList.remove('bg-green-100', 'border-green-500'));
            document.getElementById(`m4-slot-${stepIndex+1}`).classList.add('bg-green-100', 'border-green-500');

            setTimeout(() => playM4Animation(stepIndex + 1), 1200);
        }

        const quizData = [
            { q: "Membagi proses memasak menjadi: siapkan bahan, masak, dan sajikan, disebut...", options: ["Dekomposisi", "Abstraksi", "Algoritma", "Pengenalan Pola"], ans: 0 },
            { q: "Jika pesanan Level 1 butuh 2 cabai, Level 2 butuh 4, maka Level 3 butuh 6. Kemampuan menebak ini disebut...", options: ["Algoritma", "Pengenalan Pola", "Dekomposisi", "Abstraksi"], ans: 1 },
            { q: "Saat membuat pesanan, Eco-Chef mengabaikan warna baju pelanggan dan fokus pada menu. Ini contoh dari...", options: ["Pengenalan Pola", "Dekomposisi", "Algoritma", "Abstraksi"], ans: 3 },
            { q: "Urutan langkah-langkah yang logis untuk menyelesaikan masalah (seperti resep masakan) disebut...", options: ["Algoritma", "Abstraksi", "Pengenalan Pola", "Dekomposisi"], ans: 0 },
            { q: "Apa tujuan utama mempelajari Berpikir Komputasional?", options: ["Menjadi koki handal", "Bisa memperbaiki komputer rusak", "Menyelesaikan masalah dengan cara logis dan sistematis", "Menghafal kode program"], ans: 2 }
        ];
        let currentQuizIndex = 0;
        
        function initQuiz() {
            state.quizScore = 0;
            state.quizCorrect = 0;
            currentQuizIndex = 0;
            showQuizQuestion();
        }

        function showQuizQuestion() {
            const data = quizData[currentQuizIndex];
            document.getElementById('quiz-progress').innerText = `Soal ${currentQuizIndex + 1} dari 5`;
            document.getElementById('quiz-question').innerText = data.q;
            
            const optContainer = document.getElementById('quiz-options');
            optContainer.innerHTML = '';
            
            data.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn p-4 text-left justify-start text-lg font-normal border-2 border-gray-300 hover:bg-purple-50';
                btn.innerText = opt;
                btn.onclick = () => selectQuizAnswer(idx, btn);
                optContainer.appendChild(btn);
            });
            
            document.getElementById('quiz-feedback').classList.add('hidden');
            document.getElementById('btn-next-quiz').classList.add('hidden');
        }

        function selectQuizAnswer(selectedIdx, btnElement) {
            // Disable all buttons
            const buttons = document.getElementById('quiz-options').querySelectorAll('button');
            buttons.forEach(b => { b.onclick = null; b.style.pointerEvents = 'none'; });

            const correctIdx = quizData[currentQuizIndex].ans;
            const fb = document.getElementById('quiz-feedback');
            fb.classList.remove('hidden');

            if(selectedIdx === correctIdx) {
                btnElement.classList.replace('border-gray-300', 'border-green-500');
                btnElement.classList.add('bg-green-100');
                fb.innerText = "✅ Tepat Sekali!";
                fb.className = "mt-4 p-3 rounded font-bold text-center text-lg bg-green-100 text-green-800 border border-green-400";
                state.quizCorrect++;
                playSound('success');
            } else {
                btnElement.classList.replace('border-gray-300', 'border-red-500');
                btnElement.classList.add('bg-red-100');
                buttons[correctIdx].classList.replace('border-gray-300', 'border-green-500');
                buttons[correctIdx].classList.add('bg-green-100');
                fb.innerText = "❌ Kurang Tepat.";
                fb.className = "mt-4 p-3 rounded font-bold text-center text-lg bg-red-100 text-red-800 border border-red-400";
                playSound('error');
            }

            document.getElementById('btn-next-quiz').classList.remove('hidden');
            if(currentQuizIndex === quizData.length - 1) {
                document.getElementById('btn-next-quiz').innerText = 'Lihat Hasil 📜';
            }
        }

        function nextQuizQuestion() {
            currentQuizIndex++;
            playSound('click');
            if(currentQuizIndex < quizData.length) {
                showQuizQuestion();
            } else {
                showCertificate();
            }
        }

        function showCertificate() {
            state.quizScore = (state.quizCorrect / 5) * 100;
            saveGameState();
            navTo('certificate');
            playSound('win');
        }

        function resetAll() {
            state.completedMissions = [];
            state.quizScore = 0;
            state.quizCorrect = 0;
            saveGameState();
            navTo('home');
            const qBtn = document.getElementById('btn-quiz');
            if(qBtn) qBtn.remove();
        }

        // Init pertama kali
        document.addEventListener('DOMContentLoaded', () => {
            if (window.innerWidth > window.innerHeight) {
                document.getElementById('landscape-overlay').style.display = 'none';
                document.getElementById('game-wrapper').style.display = 'block';
            }
            if (document.getElementById('screen-quiz')) initQuiz();
            if (document.getElementById('screen-certificate')) {
                document.getElementById('cert-score').innerText = state.quizScore;
                document.getElementById('cert-correct').innerText = state.quizCorrect;
                document.getElementById('cert-wrong').innerText = 5 - state.quizCorrect;
                document.getElementById('cert-date').innerText = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
            }
            const quizButton = document.getElementById('btn-quiz');
            if (quizButton && state.completedMissions.length === 4) quizButton.classList.remove('hidden');
        });
