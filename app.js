let currentUser = null;

function showLogin() {
    document.getElementById("loginForm").hidden = false;
    document.getElementById("registerForm").hidden = true;
}

function showRegister() {
    document.getElementById("loginForm").hidden = true;
    document.getElementById("registerForm").hidden = false;
}

function msg(text) {
    document.getElementById("message").textContent = text;
}

async function register() {

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: name
            }
        }
    });

    if (error) {
        msg(error.message);
        return;
    }

    msg("Pendaftaran berhasil. Periksa email untuk verifikasi jika diminta.");
}

async function login() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        msg(error.message);
        return;
    }

    currentUser = data.user;

    await loadDashboard();
}

async function logout() {

    await db.auth.signOut();

    currentUser = null;

    document.getElementById("dashboard").hidden = true;
    document.getElementById("authSection").hidden = false;
    document.getElementById("logoutBtn").hidden = true;
}

async function loadDashboard() {

    const { data, error } = await db
        .from("profiles")
        .select("display_name, points")
        .eq("id", currentUser.id)
        .single();

    if (error) {
        msg("Gagal memuat profil: " + error.message);
        return;
    }

    document.getElementById("authSection").hidden = true;
    document.getElementById("dashboard").hidden = false;
    document.getElementById("logoutBtn").hidden = false;

    document.getElementById("username").textContent =
        data.display_name || "Member";

    document.getElementById("points").textContent =
        Number(data.points || 0).toLocaleString("id-ID");

    await loadHistory();
}

async function claimToken() {

    const wallet = document.getElementById("wallet").value.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
        document.getElementById("claimMessage").textContent =
            "Alamat wallet BNB tidak valid.";
        return;
    }

    const { error } = await db
        .from("airdrop_claims")
        .insert({
            user_id: currentUser.id,
            wallet_address: wallet,
            status: "pending"
        });

    if (error) {
        document.getElementById("claimMessage").textContent =
            error.message;
        return;
    }

    document.getElementById("claimMessage").textContent =
        "Pengajuan berhasil. Menunggu pemeriksaan admin.";

    document.getElementById("wallet").value = "";

    await loadHistory();
}

async function loadHistory() {

    const { data, error } = await db
        .from("airdrop_claims")
        .select("wallet_address,status,created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

    const history = document.getElementById("history");

    history.replaceChildren();

    if (error || !data || data.length === 0) {
        history.textContent = "Belum ada pengajuan.";
        return;
    }

    data.forEach(item => {

        const row = document.createElement("p");

        row.style.padding = "10px";
        row.style.borderBottom = "1px solid #303747";
        row.style.overflowWrap = "anywhere";

        row.textContent =
            item.wallet_address + " — " + item.status;

        history.appendChild(row);

    });
}

document.getElementById("registerForm")
.addEventListener("submit", function(e) {
    e.preventDefault();
    register();
});

document.getElementById("loginForm")
.addEventListener("submit", function(e) {
    e.preventDefault();
    login();
});

async function init() {

    const { data } = await db.auth.getSession();

    if (data.session) {
        currentUser = data.session.user;
        await loadDashboard();
    }

    db.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            currentUser = null;
            document.getElementById("dashboard").hidden = true;
            document.getElementById("authSection").hidden = false;
            document.getElementById("logoutBtn").hidden = true;
        }
    });
}

init();
