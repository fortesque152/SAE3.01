// js/vehiclesUI.js

export function initVehiclesUI(user) {
  const vehicleTypeDiv = document.getElementById("vehicleType");
  const addVehicleForm = document.getElementById("addVehicleForm");
  const showAddVehicleBtn = document.getElementById("showAddVehicleBtn");
  const vehicleNameInput = document.getElementById("vehicleName");
  const vehicleTypeSelect = document.getElementById("vehicleTypeSelect");

  // Toggle formulaire
  showAddVehicleBtn.addEventListener("click", () => {
    addVehicleForm.style.display =
      addVehicleForm.style.display === "none" ? "block" : "none";
  });

  function renderVehicles() {
    vehicleTypeDiv.innerHTML = "";
    const vehicles = user.getVehicles();

    if (!vehicles.length) {
      vehicleTypeDiv.textContent = "Aucun véhicule";
      return;
    }

    vehicles.forEach((v, i) => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="vehicle"  id="${v.id}" value="${v.vehicle_name}" ${i === 0 ? "checked" : ""}>
        ${v.vehicle_name} (${v.name})
      `;
      vehicleTypeDiv.appendChild(label);

      label.querySelector("input").addEventListener("change", async (e) => {
        user.setCurrentVehicle(v.name);
      });
    });
  }

  // Soumission ajout véhicule
  addVehicleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = vehicleNameInput.value.trim();
    const type = vehicleTypeSelect.value;

    if (!name) return alert("Entrez un nom");

    const res = await fetch("./vue/add_vehicule.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });

    const result = await res.json();

    if (result.success) {
      user.addVehicle({
        vehicle_name: result.vehicle.name,
        name: result.vehicle.type,
      });
      renderVehicles();
      vehicleNameInput.value = "";
      addVehicleForm.style.display = "none";
    } else {
      alert("Erreur ajout véhicule");
    }
  });



  const removeVehicleBtn = document.getElementById("removeVehicleBtn");

  removeVehicleBtn.addEventListener("click", async () => {
    const selected = document.querySelector('input[name="vehicle"]:checked');

    if (!selected) {
      alert("Veuillez sélectionner un véhicule à supprimer.");
      return;
    }

    const vehicleType = selected.id;

    if (!confirm("Supprimer ce véhicule ?")) return;
    const res = await fetch("./vue/remove_vehicle.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleType }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      alert("Erreur serveur (PHP)");
      return;
    }

    if (!data.success) {
      alert(data.message || "Erreur suppression");
      return;
    }


    // Recharge les véhicules depuis la BDD
    await user.reloadVehicles();

    // Réaffiche l'UI
    renderVehicles();
  });
  // Chargement initial
  user.reloadVehicles().then(renderVehicles);
}
