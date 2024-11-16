import { Context, Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();


app.get('/reviews/place/:placeId', async (c: Context) => {
  const placeId = c.req.param('placeId');
  
  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
      
    const reviews = await prisma.review.findMany({
      where: { placeId },
      include: {
        user: { select: { email: true } },
        place:{select:{name:true}}
      },
    });

    return c.json(reviews);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

app.post('/reviews', async (c: Context) => {
  const { rating, comment, userId, placeId, images } = await c.req.json();

  if (!rating || !userId || !placeId) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

   
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        user: { connect: { id: userId } },
        place: { connect: { id: placeId } },
      },
    });
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        await prisma.image.create({
          data: {
            url: imageUrl,  
            placeId: placeId,
            uploadedById: userId,
            reviewId: newReview.id,  
          },
        });
      }
    }

    return c.json(newReview, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});



app.put('/reviews/:reviewId', async (c: Context) => {
  const reviewId = c.req.param('reviewId');
  const { rating, comment } = await c.req.json();

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
      
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
    });

    return c.json(updatedReview);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});


app.delete('/reviews/:reviewId', async (c: Context) => {
  const reviewId = c.req.param('reviewId');

  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
      
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return c.json({ message: 'Review deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: message }, 500);
  }
});

export default app;
