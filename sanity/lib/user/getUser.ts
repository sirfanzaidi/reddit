import { sanityFetch } from "../live"; 
import { defineQuery } from "groq";
import { addUser } from "./addUser";
import { currentUser} from "@clerk/nextjs/server"


interface UserResult {
    _id: string;
    username: string;
    imageUrl: string;
    email: string;
}

const parseUsername = (username: string) => {
    // remove withespace and convert to camelCase with random number to avoid conflicts
    const randomNum = Math.floor(1000+ Math.random() * 9000);
    // convert whitespace to cameCase and add random number to avoid conflicts
    return (
        username
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // convert whitespace to cameCase
        .replace(/\s+/g, "") + randomNum  //remove all whitespace and add random number
    );
};

export async function getUser(): Promise<UserResult | { error: string }> {
    try {
            console.log("Getting current user from Clerk");
            const loggedInUser =  await currentUser();

            if (!loggedInUser) {
                console.log("No user logged in");
                return { error: "User not found"};
            }
            
            console.log(`Found Clerk user: ${loggedInUser.id}`);
            
            const getExistingUserQuery = defineQuery (
            `*[_type == "user" && _id == $id] [0]`
        );

        console.log("Checking if user exists in Sanity database");
        const existingUser = await sanityFetch({
            query: getExistingUserQuery,
            params: { id:loggedInUser.id},
        });

        // if user exist, return the user data
    if (existingUser.data?._id) {
        console.log(`User found in database with ID: ${existingUser.data._id}`);
        const user = {
            _id: existingUser.data._id,
            username: existingUser.data.username!,
            imageUrl: existingUser.data.imageUrl?.asset?._ref ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${existingUser.data.imageUrl.asset._ref.replace('image-', '').replace('-jpg', '.jpg')}` : '',
            email: existingUser.data.email!,
        };

    return user;
}

console.log("User not found in database, createing new user");
// if user doesnot existingUser, crate a new user
const newUser = await addUser({
    id: loggedInUser.id,
    username: parseUsername(loggedInUser.fullName!),
    email:
    loggedInUser.primaryEmailAddress?.emailAddress || loggedInUser.emailAddresses[0].emailAddress,
    imageUrl: loggedInUser.imageUrl
});
console.log(`New user created with ID: ${newUser._id}`);
const user = {
    _id: newUser._id,
    username: newUser.username,
    imageUrl: newUser.imageUrl,
    email: newUser.email,
};
    return user;




    } catch (error) {
        console.error("Error getting user:", error);
        return { error: "failed to get user"};

    }
}