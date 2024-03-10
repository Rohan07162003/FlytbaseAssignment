import express from "express"
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import Site from "./models/Site.js";
import Category from "./models/Category.js";
import Drone from "./models/Drone.js";
import Mission from "./models/Mission.js";
dotenv.config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'ygfyugwefyfuew78wefg8wef7';
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)
app.get('/test', (req, res) => {
    res.json('test ok');
})

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const Userdoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        })

        res.json(Userdoc);
    } catch (err) {
        res.status(422).json(err)
    }

})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const UserDo = await User.findOne({ email })
    console.log(UserDo);
    if (UserDo) {
        const passOk = bcrypt.compareSync(password, UserDo.password);
        if (passOk) {
            jwt.sign({ email: UserDo.email, id: UserDo._id }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(UserDo);
            })
        }
        else {
            res.status(422).json('password not ok');
        }
    } else {
        res.json('not found');
    }
});
app.get('/profile', (req, res) => {

    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        });
    } else {
        res.json(null);
    }
});
app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
});
app.post('/sites', async (req, res) => {
    const { token } = req.cookies;
    const { site_name, position } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            throw err;
        }
        try {
            const siteDoc = await Site.create({
                site_name,
                position,
                Owner: userData.id,
            });
            res.json(siteDoc);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create site' });
        }
    });
});
app.put('/sites/:id', async (req, res) => {
    const { token } = req.cookies;
    const { id } = req.params;
    const { site_name, position } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const SiteDoc = await Site.findById(id);
        if (userData.id == SiteDoc.Owner.toString()) {
            SiteDoc.set({
                site_name,
                position
            });
            await SiteDoc.save();
            res.json('ok');
        }
    });
});
app.delete('/sites', async (req, res) => {
    const { siteId } = req.body;
    const { token } = req.cookies;
    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }

            const site = await Site.findOne({ _id: siteId, Owner: userData.id });
            if (!site) {
                return res.status(404).json({ message: 'Site not found or user does not have permission' });
            }

            await Site.deleteOne({ _id: siteId });
            res.json({ message: 'Site deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete site' });
    }
});
app.post('/categories', async (req, res) => {
    const { token } = req.cookies;
    const { name, color, tag_name } = req.body;

    // const parsedCreatedAt = new Date(created_at.$date);
    // const parsedUpdatedAt = new Date(updated_at["$date"]);

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            throw err;
        }
        try {
            const categoryDoc = await Category.create({
                name,
                color,
                tag_name,
                Owner: userData.id
            });
            res.json(categoryDoc);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create category' });
        }
    });
});
app.put('/categories/:id', async (req, res) => {
    const { token } = req.cookies;
    const { id } = req.params;
    const { name, color, tag_name } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const CategoryDoc = await Category.findById(id);
        if (userData.id == CategoryDoc.Owner.toString()) {
            CategoryDoc.set({
                name,
                color,
                tag_name,
            });
            await CategoryDoc.save();
            res.json('ok');
        }
    });
});
app.delete('/categories', async (req, res) => {
    const { categoryId } = req.body;
    const { token } = req.cookies;

    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }

            const category = await Category.findOne({ _id: categoryId, Owner: userData.id });
            if (!category) {
                return res.status(404).json({ message: 'category not found or user does not have permission' });
            }

            await Category.deleteOne({ _id: categoryId });
            res.json({ message: 'Category deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});
app.post('/drones/:siteid', async (req, res) => {
    const { siteid } = req.params;
    const { drone_id, drone_type, make_name, name } = req.body;
    const { token } = req.cookies;

    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }

            const sitefound = await Site.findOne({ _id: siteid, Owner: userData.id });
            if (!sitefound) {
                return res.status(404).json({ message: 'site not found or user does not have permission' });
            }
            try {
                const droneDoc = await Drone.create({
                    drone_id,
                    drone_type,
                    make_name,
                    name,
                    site: siteid
                });
                res.json(droneDoc);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to add drone under a site' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add drone' });
    }
});

app.put('/drones/updatedrone/:droneid', async (req, res) => {
    const { droneid } = req.params;
    const { token } = req.cookies;
    const { make_name, drone_type, name } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        try {
            const dronefound = await Drone.findOne({ drone_id: droneid }).populate('site', 'Owner');
            if (!dronefound) {
                return res.status(404).json({ message: 'Drone not found' });
            }
            if (userData.id !== dronefound.site.Owner.toString()) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            dronefound.set({
                name,
                make_name,
                drone_type,
            });

            await dronefound.save();
            res.json('ok good');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update drone' });
        }


    });
})

app.delete('/drones/:droneId', async (req, res) => {
    const { droneId } = req.params;
    const { token } = req.cookies;

    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }
            const drone = await Drone.findOne({ drone_id: droneId }).populate('site');
            if (!drone) {
                return res.status(404).json({ message: 'Drone not found' });
            }
            if (drone.site.Owner.toString() !== userData.id) {
                return res.status(403).json({ message: 'You are not authorized to delete this drone' });
            }

            await Drone.deleteOne({ drone_id: droneId });
            res.json({ message: 'Drone deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete drone' });
    }
});

app.post('/missions/:siteid', async (req, res) => {
    const { siteid } = req.params;
    const { alt, speed, name, waypoints } = req.body;
    const { token } = req.cookies;

    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }

            const sitefound = await Site.findOne({ _id: siteid, Owner: userData.id });
            if (!sitefound) {
                return res.status(404).json({ message: 'site not found or user does not have permission' });
            }
            try {
                const missionDoc = await Mission.create({
                    alt,
                    speed,
                    name,
                    waypoints,
                    site: siteid
                });
                res.json(missionDoc);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to add mission under a site' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add mission' });
    }
});

app.put('/missions/updatemission/:missionid', async (req, res) => {
    const { missionid } = req.params;
    const { alt, speed, name, waypoints } = req.body;
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        try {
            const missionfound = await Mission.findById(missionid).populate('site', 'Owner');
            if (!missionfound) {
                return res.status(404).json({ message: 'Mission not found' });
            }
            if (userData.id !== missionfound.site.Owner.toString()) {
                return res.status(403).json({ message: 'Unauthorized access' });
            }

            missionfound.set({
                alt,
                speed,
                name,
                waypoints,
            });

            await missionfound.save();
            res.json('ok good');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update mission' });
        }


    });
})

app.delete('/missions/:missionId', async (req, res) => {
    const { missionId } = req.params;
    const { token } = req.cookies;

    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }

            const mission = await Mission.findById(missionId).populate('site');
            if (!mission) {
                return res.status(404).json({ message: 'Mission not found' });
            }

            
            if (mission.site.Owner.toString() !== userData.id) {
                return res.status(403).json({ message: 'You are not authorized to delete this mission' });
            }

            await Mission.deleteOne({ _id: missionId });
            res.json({ message: 'Mission deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete mission' });
    }
});

//get all missions under a site
app.get('/sites/:siteId/missions',async(req,res)=>{
    const {siteId}=req.params;
    try{
        const missions = await Mission.find({site:siteId});
        res.json(missions);
    }catch(err){
        console.error(err);
        res.status(400);
    }
})
//get all drones under a site
app.get('/sites/:siteId/drones',async(req,res)=>{
    const {siteId}=req.params;
    try{
        const drones =await Drone.find({site:siteId});
        res.json(drones);
    }catch(err){
        console.error(err);
        res.status(400);
    }
})
//shift drone from one site to another
app.put('/drones/:droneid/shiftsite/:siteid',async (req,res)=>{
    const {droneid,siteid}= req.params;
    const {token} =req.cookies
    try{
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }
            const dronefound= await Drone.findOne({drone_id:droneid}).populate('site');
            if(!dronefound){
                return res.status(404).json("Drone not found")
            }
            if(userData.id !== dronefound.site.Owner.toString()){
                return res.status(403).json({ message: 'You are not authorized to shift this drone' });
            }
            dronefound.set({site:siteid})
            await dronefound.save();
            res.json("shifted drone")
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error:"failed to change site"})
    }
})
//add category to mission
app.put('/missions/:missionId/category/:categoryid', async (req, res) => {
    const { missionId,categoryid } = req.params;
    const { token } = req.cookies;

    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                throw err;
            }

            const mission = await Mission.findById(missionId).populate('site');
            if (!mission) {
                return res.status(404).json({ message: 'Mission not found' });
            }

            
            if (mission.site.Owner.toString() !== userData.id) {
                return res.status(403).json({ message: 'You are not authorized to edit this mission' });
            }
            const category = await Category.findById(categoryid);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            if(category.Owner.toString()!== userData.id){
                return res.status(403).json({ message: 'You are not authorized to edit this mission' });
            }

            mission.set({
                category:categoryid
            });

            await mission.save();
            res.json('ok good');
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update mission' });
    }
});

//get all missions under a category
app.get('/category/:categoryId/missions',async(req,res)=>{
    const {categoryId}=req.params;
    try{
        const missions = await Mission.find({category:categoryId});
        res.json(missions);
    }catch(err){
        console.error(err);
        res.status(400).json("error");
    }
})
app.listen(4000)
// ZbQU75N4zXJUCJm6