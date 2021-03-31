/* eslint-disable no-return-assign */
import Prismic from '@prismicio/client';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Comments from '../../components/Comments';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  nexpost: { uid: string };
  prevpost: { uid: string };
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}
interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const tempRead = post.data.content.reduce((acc, content) => {
    const textBody = RichText.asText(content.body)
      .split(/<.+?>(.+?)<\/.+?>/g)
      .filter(t => t);

    const ar = [];
    textBody.forEach(fr => {
      fr.split(' ').forEach(pl => {
        ar.push(pl);
      });
    });

    const min = Math.ceil(ar.length / 200);
    return acc + min;
  }, 0);

  return (
    <>
      <Header />
      <main>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </div>
        <div className={styles.container}>
          <article>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <div>
                <FiCalendar />
                <span>
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM' 'yyyy",
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>

              <div>
                <FiClock />
                <span>{tempRead} min</span>
              </div>
            </div>
            <div className={styles.lastDateEditing}>
              *editado em{' '}
              {format(
                new Date(post.last_publication_date),
                "dd MMM' 'yyyy', às 'kk:mm'",
                {
                  locale: ptBR,
                }
              )}
            </div>

            {post.data.content.map(section => (
              <div className={styles.section} key={`${section.heading}`}>
                <h1>{section.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(section.body),
                  }}
                />
              </div>
            ))}
          </article>
          <div className={styles.postsNaveNextAndRedo}>
            <div>
              <span>Como utilizar Hooks</span>
              <span>Criando um app CRA do Zero</span>
            </div>
            {console.log(post.nexpost, post.prevpost)}
            <div>
              {post.prevpost?.uid !== undefined ? (
                <Link href={`/post/${post.prevpost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              ) : null}
              {post.nexpost?.uid !== undefined ? (
                <Link href={`/post/${post.nexpost?.uid}`}>
                  <a>Próximo post </a>
                </Link>
              ) : null}
            </div>
          </div>
          <Comments />
          {preview && (
            <aside className={styles.buttonModePreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.uid'],
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});
  const prevpost = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: `${response.uid}`,
      orderings: '[document.last_publication_date desc]',
    }
  );
  const nextpost = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: `${response.uid}`,
      orderings: '[document.last_publication_date]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    prevpost: prevpost?.results[0],
    nextpost: nextpost?.results,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 3600, // 1 hora
  };
};
