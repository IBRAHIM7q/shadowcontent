  const fetchFollowers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.getInstance()
        .from('follows')
        .select(`
          follower_id,
          users!followers_follower_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('following_id', id)