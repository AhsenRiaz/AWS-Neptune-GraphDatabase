import getPerson from "./getPerson"
import getFriends from "./getFriends"
import getFriendsOfFriend from "./getFriendsOfFriend"
import getHighestRatedByCuisine from "./getHighestRatedByCuisine"
import getHighestByRating from "./getHighestByRating"
import getNewReviews from "./getNewReviews"
import getFriendsRecommendedRestaurants from "./getFriendsRecommendedRestaurants"
import getFriendsRecommendedRestaurantsBasedOnReviewRating from "./getFriendsRecommendedRestaurantsBasedOnReviewRating"

type AppSyncEvent = {

    info  : {
        fieldName : String
    },

    arguments : {
        restaurant_name : string
    }

}

exports.handler = async (event: AppSyncEvent)  => {

    switch(event.info.fieldName){

        case "getPerson":
            return await getPerson()
        case "getFriends":
            return await getFriends()
        case "getFriendsOfFriend":
            return await getFriendsOfFriend()
        case "getHighestRatedByCuisine":
           return await getHighestRatedByCuisine()
        case "getHighestByRating":
            return await getHighestByRating()
        case "getNewReviews":
            return await getNewReviews(event.arguments.restaurant_name)
        case "getFriendsRecommendedRestaurants":
            return await getFriendsRecommendedRestaurants()
        case "getFriendsRecommendedRestaurantsBasedOnReviewRating":
            return await getFriendsRecommendedRestaurantsBasedOnReviewRating()
    }

}