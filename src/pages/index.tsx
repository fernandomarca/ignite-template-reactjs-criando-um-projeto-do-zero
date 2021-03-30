import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  function loadMore(): void {
    fetch(nextPage)
      .then(response => {
        return response.json();
      })
      .then(data => {
        const { next_page } = data;

        const results: Post[] = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...results]);
        setNextPage(next_page);
      });
  }
  // console.log(posts);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className={styles.container}>
        <header>
          <img src="/logo.svg" alt="logo" />
        </header>
        <main>
          {postsPagination.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <article>
                  <h1>{post.data.title}</h1>
                  <h4>{post.data.subtitle}</h4>
                  <div className={styles.info}>
                    <div>
                      <FiCalendar />
                      <span>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
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
                  </div>
                </article>
              </a>
            </Link>
          ))}

          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <article>
                  <h1>{post.data.title}</h1>
                  <h4>{post.data.subtitle}</h4>
                  <div className={styles.info}>
                    <div>
                      <FiCalendar />
                      <span>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
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
                  </div>
                </article>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={loadMore}>
              Carregar mais posts
            </button>
          )}

          {preview && (
            <aside className={styles.buttonModePreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: { postsPagination: { next_page, results }, preview },
  };
};
