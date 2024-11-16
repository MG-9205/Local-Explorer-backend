import { Context, Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

app.get('/placeName/:name', async (c: Context) => {
  const name = c.req.param('name'); 

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

  
    const places = await prisma.place.findMany({
      where: name
        ? {
            name: {
              contains: name,  
              mode: 'insensitive', 
            },
          }
        : {}, 
      include: {
        reviews: true,
        images: true,
        favorites: true,
        category: {
          select: {
            name: true,  
          },
        },
      },
    });

    return c.json(places);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});




app.get('/places/:id', async (c: Context) => {
  const placeId = c.req.param('id');

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        reviews: true,
        images: true,
        favorites: true,
      },
    });

    if (!place) {
      return c.json({ error: 'Place not found' }, 404);
    }

    return c.json(place);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

app.post('/Newplaces', async (c: Context) => {
  const { name, address, perImage, latitude, longitude, categoryId, description, tags } = await c.req.json();

  
  if (!name || !address || !latitude || !longitude || !categoryId) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const newPlace = await prisma.place.create({
      data: {
        name,
        address,
        description,
        perImage,
        latitude,
        longitude,
        categoryId,
       
        tags: tags
          ? {
              connect: tags.map((tagId: string) => ({ id: tagId })), 
            }
          : undefined,  
      },
    });

    return c.json(newPlace, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});


app.put('/places/:id', async (c: Context) => {
  const placeId = c.req.param('id');
  const { name, address, perImage, latitude, longitude, categoryId } = await c.req.json();

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const updatedPlace = await prisma.place.update({
      where: { id: placeId },
      data: {
        name,
        address,
        perImage,
        latitude,
        longitude,
        categoryId,
      },
    });

    return c.json(updatedPlace);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});


app.delete('/places/:id', async (c: Context) => {
  const placeId = c.req.param('id');

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    await prisma.place.delete({
      where: { id: placeId },
    });

    return c.json({ message: 'Place deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

app.get('/places/Category/:Category', async (c: Context) => {
  const categoryName = c.req.param('Category');

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const places = await prisma.place.findMany({
      where: {
        category: {
          name: categoryName, 
        },
      },
      include: {
        reviews: true,
        images: true,
        favorites: true,
      },
    });

    if (places.length === 0) {
      return c.json({ message: 'No places found for this category' }, 404);
    }

    return c.json(places);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});
  
 
  
export default app;
