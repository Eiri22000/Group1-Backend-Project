// Get plant photo from Perenual Plan API
const randomImage = async (number) => {
    // Call from plantInfo has an plantId to get info from specific plant, otherwise use random to create background
    if (number === undefined) {
        number = Math.floor(Math.random() * 3001)
    }
    var image = ""
    var info = {}
    var plantId
    // try {
    //     await fetch('https://perenual.com/api/species/details/' + number + '?' + new URLSearchParams({
    //         key: process.env.PLANTAPIKEY,
    //     }))
    //         .then(res => res.json())
    //         .then(json => {
    //             plantId =json.id;
    //             info = {name:json.common_name, scientificName:json.scientific_name, image: json.original_url, light:json.sunlight, propagation:json.propagation, watering:json.watering}
    //             const defImage =json.default_image
    //             if (defImage.original_url !== undefined || defImage.original_url !== null) {
    //                         image = defImage.original_url
    //                         console.log("minussa on kuva")
    //             }
    //         })
    // }
    // catch (error) {
    // // Set image from public folder as a default
    //     image = "testBackground.jpg"
    //     info = { name: "Zebra Plant", scientificName: "Calathea orbifolia", image: "testBackground.jpg", light: "Half shade", propagation: "seeds, division", watering: "Keep moist" }
    //     plantId = 6000
    // }  
    return { image, plantId, info }
}

module.exports = {randomImage}