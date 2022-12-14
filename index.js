/* Gestion des cases à cocher dans le dropdown menu Afficher Options */
$(".checkbox-menu").on("change", "input[type='checkbox']", function () {
  $(this).closest("li").toggleClass("active", this.checked);
});

$(document).on("click", ".allow-focus", function (e) {
  e.stopPropagation();
});

let url = "https://fr.openfoodfacts.org/api/2/product/";

$("#btnRechercher").click(appelApi);

/* Connexion à l'API OpenFoodFact*/
function appelApi() {
  let codeBarre = $("#codeBarre").val();
  const fullUrl = url + codeBarre;

  $.ajax(fullUrl, {
    success: function (value) {
      printResults(value);
      addTableauNutritionnel(value.product.nutrient_levels);
      showPhotoVerdict(value);
    },
  });
}

/* Affichage des informations retournées par l'API*/
function printResults(value) {
  $("#nomProduit").html(
    "<span class='label'>Nom : </span>" + value.product.product_name
  );
  $("#codeEan13").html("<span class='label'>Code EAN13 : </span>" + value.code);
  $("#photoProduit").attr("src", value.product.image_front_small_url);
  $("#listeIngredients").html(value.product.ingredients_text);
  $("#listeAllergenes").html(value.product.allergens);
}

function addTableauNutritionnel(liste) {
  $("#graisses").html("Graisses : " + traduireNiveauNutritionnel(liste.fat));
  $("#graissesSaturees").html(
    "Graisses saturées : " + traduireNiveauNutritionnel(liste["saturated-fat"])
  );
  $("#sel").html("Sel : " + traduireNiveauNutritionnel(liste.salt));
  $("#sucre").html("Sucres : " + traduireNiveauNutritionnel(liste.sugars));
}

function traduireNiveauNutritionnel(termeATraduire) {
  switch (termeATraduire) {
    case "high":
      return "<span id='high'>Elevé</span>";
    case "moderate":
      return "<span id='moderate'>Modéré</span>";
    case "low":
      return "<span id='low'>Bas</span>";
    default:
      return "<span id='undefined'>Non défini</span>";
  }
}

/* Affichage du verdict final */

function calculScoreFinal(produit) {
  let scoreFinal = 0;

  switch (produit.product.nutriscore_grade) {
    case "a":
      scoreFinal = -2;
      break;
    case "b":
      scoreFinal = -1;
      break;
    /* le case c n'est pas pris en compte car =0 */
    case "d":
      scoreFinal = 1;
      break;
    case "e":
      scoreFinal = 2;
      break;
  }

  switch (produit.product.nova_group) {
    case 1:
      scoreFinal -= 2;
      break;
    case 2:
      scoreFinal -= 1;
      break;
    case 3:
      scoreFinal += 1;
      break;
    case 4:
      scoreFinal += 2;
      break;
  }

  switch (produit.product.ecoscore_grade) {
    case "a":
      scoreFinal -= 2;
      break;
    case "b":
      scoreFinal -= 1;
      break;
    /* le case c n'est pas pris en compte car =0 */
    case "d":
      scoreFinal += 1;
      break;
    case "e":
      scoreFinal += 2;
      break;
  }

  return scoreFinal;
}

function showPhotoVerdict(value) {
  let scoreFinal = calculScoreFinal(value);
  let chemin = "";

  if (scoreFinal === 0) {
    chemin = "img/neutre.jpg";
  } else if (scoreFinal < 0) {
    chemin = "img/OK.jpg";
  } else {
    chemin = "img/caca.jpg";
  }

  $("#photoVerdict").attr("src", chemin);
}
