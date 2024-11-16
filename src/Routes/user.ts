
import { Context, Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import {withAccelerate} from "@prisma/extension-accelerate"


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();


app.get('/users/:id', async (c: Context) => {
  const userId = c.req.param('id');
  
  try {
    const prisma=new PrismaClient({
      //@ts-ignore
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        favorites: {
          include: { place: true },
        },
        reviews: true,
      },
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});


app.post('/', async (c: Context) => {
  const { clerkId, email } = await c.req.json();

  try {
    const prisma = new PrismaClient({
      // @ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

  
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      return c.json(existingUser,201);
    }

    
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
      },
    });

    return c.json(newUser, 201); 
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500); 
  }
});



app.put('/users/:id', async (c) => {
  const userId = c.req.param('id');
  const { name } = await c.req.json();

  try {
    const prisma=new PrismaClient({
      //@ts-ignore
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
 
    return c.json("done");
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

// Delete User
app.delete('/users/:id', async (c) => {
  const userId = c.req.param('id');

  try {
    const prisma=new PrismaClient({
      //@ts-ignore
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    await prisma.user.delete({
      where: { id: userId },
    });

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

export default app;
